// /pages/api/ai-quiz-walk/quiz/create.ts
import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { Question } from "@/lib/frontend/quiz/types";

/** LLM이 출력해야 하는 형태 **/
type LlmQuestion = {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  answer: "A" | "B" | "C" | "D";
};

const LlmQuestionZ = z.object({
  question: z.string().min(1),
  options: z.object({
    A: z.string().min(1),
    B: z.string().min(1),
    C: z.string().min(1),
    D: z.string().min(1),
  }),
  answer: z.enum(["A", "B", "C", "D"]),
});

const RequestZ = z.object({
  topic: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  previousQuestions: z.array(z.string().min(1)).optional(), // 추가
});

const getModel = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is missing");
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Question | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const parsed = RequestZ.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: "요청 형식이 올바르지 않습니다." });
  }

  const { topic, difficulty, previousQuestions = [] } = parsed.data;

  // 프롬프트 내 중복 회피 섹션
  const avoidList =
    previousQuestions.length > 0
      ? `\n\n아래의 과거 질문들과 (문장부호/띄어쓰기 무시 시) 동일하거나 매우 유사한 문제는 절대 출제하지 마:\n- ${previousQuestions
          .slice(-50) // 최근 50개만 사용 (과도한 토큰 방지)
          .join("\n- ")}\n`
      : "";

  const prompt = `
[역할]
너는 '${topic}'(김홍도/단원 테마의 하위 주제)와 관련된 **사실 기반 4지선다형 퀴즈** 출제자다.
반드시 **김홍도(단원)**, **조선 후기 풍속화**, **작품/장면(씨름·서당·장터·잔치·무동 등)**, **당시 생활문화(의복·놀이·직업·도구·건축)** 범주 안에서만 출제하라.

[출제 범위(예시)]
- 인물/배경: 김홍도(단원)의 활동 시기/화풍 특징/장르(풍속화) 맥락
- 작품 장면: 씨름, 서당, 장터, 잔치, 무동(춤), 어부/농사, 한옥/가옥 구조, 전통 의복/갓, 악기(장구·북)
- 관찰 포인트: 인물 표정/몸짓, 계절 단서, 직업/도구, 놀이/풍습, 공간 배치
※ 특정 작품 실명·연도·소장처 등 **확실히 검증 가능한 사실만** 사용. 불확실하면 동일 주제의 다른 **검증 가능한 하위 사실**로 전환.

[과거 문제(중복 금지 기준)]
아래 "과거 문제"를 먼저 분석하라. 각 항목에서 핵심 사실(주어·핵심명사·지명/연도/수치·동사)을 추출하고, 새 문제는 다음을 모두 만족해야 한다.
1) 질문 본문이 과거 문제의 단순 재서술이면 안 된다.
2) 정답을 성립시키는 핵심 사실(인물/연도/지명/정의/수치 등)이 과거 문제와 달라야 한다.
3) 핵심 명사/개념 최소 2개 이상이 과거 문제들과 달라야 한다.
4) 공백/문장부호 제거 후에도 어느 과거 질문과 **어절 40% 이상 동일** 금지.
5) 질문 유형을 바꿔라: [정의·개념, 특징, 비교, 관찰 단서(계절/도구/의복 등), 장면 추론, 순서·절차, 예외] 중 과거에 많이 쓴 유형은 피하라.

[과거 문제]
${avoidList}

[품질/사실성 규칙]
- **공신력 있는 출처**(박물관/문화재청/국공립기관/위키백과 등)로 검증 가능한 사실만 사용.
- 불확실한 연도/소장처/작품명은 **사용 금지**. 확실치 않으면 장면 묘사 기반의 관찰·비교형 문제로 전환.
- 오답 3개는 같은 주제군(동시대/유사 장면/유사 도구)에서 **실재하는 요소**로 구성하되, 정답과 충돌 금지.
- 보기 4개는 길이/구체성 편향 최소화(정답만 유독 길거나 구체적 금지).
- **어린이도 이해할 수 있는 어휘**로 간결하게 작성. (easy일수록 쉬운 단어/짧은 문장)
  - easy: 관찰 중심(“무엇을 하고 있나요?”, “어느 계절일까요?”)
  - medium: 특징/비교 중심(“왜 그렇게 보일까요?”, “둘 중 어떤 게 맞을까요?”)
  - hard: 개념/사실 구분(“풍속화의 특징으로 알맞은 것은?”, “~의 용도는 무엇일까요?”)

[출제 지침]
- '${topic}'을 바탕으로 **김홍도(단원) 맥락**의 4지선다형 문제 1개만 작성.
- 난이도는 '${difficulty}'.
- 질문 1개, 보기(A~D) 4개, 정답 1개(A|B|C|D) 포함.
- 허구/추측 금지. **그림/장면/생활문화 근거**로 답이 명확히 갈리게 작성.

[내부 체크리스트 — 출력 금지]
- (a) 핵심 명사/지명/사실이 과거와 2개 이상 다른가?
- (b) 패러프레이즈가 아닌가?
- (c) 질문 유형이 과거와 다른가?
- (d) 보기 4개가 상호배타적이고 정답만 과도하게 길지 않은가?
- (e) 정답은 단일 사실로 검증 가능한가?

[출력 형식 — 아래 JSON만 출력. 마크다운/설명/코드블록 금지]
{
  "question": "질문 내용",
  "options": {
    "A": "보기 A 내용",
    "B": "보기 B 내용",
    "C": "보기 C 내용",
    "D": "보기 D 내용"
  },
  "answer": "A" | "B" | "C" | "D"
}
`.trim();

  try {
    const model = getModel();
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
        maxOutputTokens: 500,
      },
    });

    // 1) LLM 응답 문자열
    const text = result.response.text();

    // 2) 파싱
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return res
        .status(500)
        .json({ error: "생성 중 오류가 발생했습니다. (1)" });
    }

    // 3) 스키마 검증
    const parsedLlm = LlmQuestionZ.safeParse(data);
    if (!parsedLlm.success) {
      return res.status(500).json({
        error: `생성 중 오류가 발생했습니다. (2): ${parsedLlm.error.message}`,
      });
    }

    const llm: LlmQuestion = parsedLlm.data;

    // 4) 클라이언트 포맷으로 변환
    const order = ["A", "B", "C", "D"] as const;
    const optionsArray = order.map((k) => llm.options[k]);
    const answerText = llm.options[llm.answer];

    const apiData: Question = {
      id:
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      question: llm.question,
      options: optionsArray,
      answer: answerText,
      difficulty,
      topic,
    };

    return res.status(200).json(apiData);
  } catch (e) {
    console.error("Error generating question:", e);
    return res.status(500).json({ error: "네트워크 에러가 발생했습니다." });
  }
}
