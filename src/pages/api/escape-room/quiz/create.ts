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
        .slice(-50)
        .join("\n- ")}\n`
    : "";

const prompt = `
[역할]
너는 '${topic}'(임꺽정 테마의 하위 주제)와 관련된 **사실 기반 4지선다형 퀴즈** 출제자다.
반드시 **임꺽정**, **조선 중기 사회상**, **의적/민중 이야기**, **당시 생활문화(의복·계급·직업·법·형벌 등)** 범주 안에서만 출제하라.

[출제 범위(예시)]
- 인물/배경: 임꺽정의 활동 시기, 신분(백정 출신), 조선 중기 사회 구조
- 사건/행동: 탐관오리 처벌, 민중 구제, 의적 활동
- 사회상: 신분제(양반·중인·상민·천민), 세금, 부패 관리
- 생활문화: 전통 의복(도포·갓), 직업, 형벌, 당시 농민 생활
※ 임꺽정 관련 내용은 **실제 역사 기록 또는 널리 알려진 사실 기반 설정만 사용** (소설적 과장 금지)

[과거 문제(중복 금지 기준)]
아래 "과거 문제"를 먼저 분석하라. 각 항목에서 핵심 사실(주어·핵심명사·지명/연도/수치·동사)을 추출하고, 새 문제는 다음을 모두 만족해야 한다.
1) 질문 본문이 과거 문제의 단순 재서술이면 안 된다.
2) 정답을 성립시키는 핵심 사실(인물/신분/개념/사회제도 등)이 과거 문제와 달라야 한다.
3) 핵심 명사/개념 최소 2개 이상이 과거 문제들과 달라야 한다.
4) 공백/문장부호 제거 후에도 어느 과거 질문과 **어절 40% 이상 동일** 금지.
5) 질문 유형을 바꿔라: [정의·개념, 특징, 비교, 사회 구조, 상황 판단, 역할 추론, 예외] 중 과거에 많이 쓴 유형은 피하라.

[과거 문제]
${avoidList}

[품질/사실성 규칙]
- **검증 가능한 역사적 사실**만 사용 (조선시대 신분제, 세금, 직업 등).
- 불확실한 연도·지명·사건은 사용 금지. 확실치 않으면 사회 구조·생활문화 기반 문제로 전환.
- 오답 3개는 같은 시대/비슷한 개념에서 **실제 존재하는 요소**로 구성하되, 정답과 충돌 금지.
- 보기 4개는 길이/구체성 편향 최소화.
- **어린이도 이해할 수 있는 어휘**로 간결하게 작성.
  - easy: 상황·행동 중심 ("임꺽정은 누구를 도왔을까요?")
  - medium: 비교·특징 중심 ("어떤 점 때문에 의적으로 불렸을까요?")
  - hard: 개념·사회 구조 ("조선의 신분제 특징으로 맞는 것은?")

[출제 지침]
- '${topic}'을 바탕으로 **임꺽정 맥락**의 4지선다형 문제 1개만 작성.
- 난이도는 '${difficulty}'.
- 질문 1개, 보기(A~D) 4개, 정답 1개(A|B|C|D) 포함.
- 허구/추측 금지. **사회 구조/행동/역할 근거**로 답이 명확히 갈리게 작성.

[내부 체크리스트 — 출력 금지]
- (a) 핵심 명사/개념이 과거와 2개 이상 다른가?
- (b) 패러프레이즈가 아닌가?
- (c) 질문 유형이 과거와 다른가?
- (d) 보기 4개가 상호배타적인가?
- (e) 정답이 단일 사실로 검증 가능한가?

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
