import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const prisma = new PrismaClient();

type Question = {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  answer: "A" | "B" | "C" | "D";
};

const QuestionZ = z.object({
  question: z.string().min(1),
  options: z.object({
    A: z.string().min(1),
    B: z.string().min(1),
    C: z.string().min(1),
    D: z.string().min(1),
  }),
  answer: z.enum(["A", "B", "C", "D"]),
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

  const { topic, difficulty = "medium" } = req.body ?? {};
  if (!topic || typeof topic !== "string") {
    return res.status(400).json({ error: "주제를 입력하세요." });
  }

  const prompt = `
  너는 '${topic}' 주제를 바탕으로 문제를 생성할 거야.

  절대로 상상하거나 추측하지 말고, 반드시 신뢰할 수 있는 실제 정보(정부 자료, 위키백과 등)만 사용해.
  정보가 확실하지 않으면 그에 대한 문제를 만들지 말고 건너뛰어.
  문제를 제작할 때 절대 가정을 하지마.

  다음 조건을 반드시 지켜:

  - '${topic}'을 기반으로 한 4지선다형 문제를 1개 만들어줘
  - 각 문제는 질문, 보기(A~D), 정답이 포함되어야 함
  - 난이도는 '${difficulty}'로 설정
  - 보기(A~D)는 각각 다른 내용이어야 함
  - 정답은 보기 중 하나로 지정 (A, B, C, D 중 하나
  - 허구의 정보, 추측, 상상력은 절대 금지
  - 이전에 생성했던 문제와는 다른 문제를 만들어줘
  - 순수 JSON 형식으로만 출력할 것 (마크다운이나 다른 형식 없이):

  {
    "question": "질문 내용",
    "options": {
      "A": "보기 A 내용",
      "B": "보기 B 내용",
      "C": "보기 C 내용",
      "D": "보기 D 내용"
    },
    "answer": "정답 (A, B, C, D 중 하나)"  
  }
  `.trim();

  try {
    const model = getModel();

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "json",
        temperature: 0.2,
        maxOutputTokens: 500,
      },
    });

    const text = result.response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ error: "응답 형식이 올바르지 않습니다." });
    }

    const parsed = QuestionZ.safeParse(data);
    if (!parsed.success) {
      return res.status(500).json({
        error: `응답 형식이 올바르지 않습니다: ${parsed.error.message}`,
      });
    }

    return res.status(200).json(parsed.data);
  } catch (e) {
    console.error("Error generating question:", e);
    return res.status(500).json({ error: "네트워크 에러가 발생했습니다." });
  }
}
