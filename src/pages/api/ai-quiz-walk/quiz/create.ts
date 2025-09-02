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
[역할] 너는 '${topic}' 주제에 대한 사실 기반 4지선다형 퀴즈 출제자다. 오직 공신력 있는 출처(정부/공공기관/위키백과 등)에서 검증 가능한 사실만 사용하라.

[과거 문제(중복 금지 기준)]
아래 "과거 문제"를 먼저 분석하라. 각 항목에서 핵심 사실 포인트(주어·핵심명사·지명/연도/수치·동사)를 뽑아라. 그런 다음, 새 문제는 다음 조건을 모두 만족해야 한다.
1) 질문 본문이 과거 문제의 단순 재서술(표현만 바꾼 패러프레이즈)이면 안 된다.
2) 정답을 성립시키는 핵심 사실(특정 인물/연도/지명/정의/수치 등)이 과거 문제와 달라야 한다.
3) 핵심 명사/개념 중 최소 2개 이상이 과거 문제들과 달라야 한다.
4) 표면 문자열 기준으로도 유사하지 않게 하라: 공백/문장부호 제거 후, 어떤 과거 질문과도 전체 어절의 40% 이상이 동일하지 않도록 하라.
5) 질문 유형을 바꿔라: [정의/개념 구분, 원인, 결과, 비교, 수치·연도, 사례, 예외, 순서·절차] 중 과거에 많이 쓴 유형은 피하고 다른 유형을 선택하라.

[과거 문제]
${avoidList}

[품질/사실성 규칙]
- 불확실한 사실은 사용 금지. 확실하지 않다면 같은 상위 주제의 다른 하위 주제로 전환하여 출제하라.
- 지역/지명은 공식 명칭 사용. 수치·연도는 최신 검증 가능한 값만 사용.
- 오답 3개는 같은 주제군에서 실제로 존재하는 명칭/연도/지명을 사용해 그럴듯하게 구성하되, 정답과 충돌하지 않게 하라.
- 보기 4개는 길이/문체 편향을 최소화하여 정답만 유독 길거나 구체적이지 않게 하라.

[출제 지침]
- '${topic}'을 기반으로 한 4지선다형 문제 1개만 작성.
- 난이도는 '${difficulty}'.
- 질문 1개, 보기(A~D) 4개, 정답 1개(A|B|C|D) 포함.
- 허구/추측/가정 금지. 사실 단위로 명확히 답이 갈리도록 작성.

[내부 체크리스트 — 출력하지 말 것]
- (a) 새 문제의 핵심 명사/연도/지명이 과거와 2개 이상 다름?
- (b) 같은 사실을 다른 말로만 바꾼 것이 아닌가?
- (c) 질문 유형이 과거와 다른가?
- (d) 보기 4개가 상호배타적이며, 정답만 과도하게 길지 않은가?
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
