// =====================================
// pages/api/ai-quiz-walk/quiz/index.ts (Page Router API, 객관식 고정 더미)
// =====================================
import type { NextApiRequest, NextApiResponse } from "next";
import type { Question } from "@/lib/frontend/quiz/types";

export default function handler(
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

  // 더미 데이터 (항상 객관식)
  const options = ["보기1", "보기2", "보기3", "보기4"];
  const question: Question = {
    id: crypto.randomUUID(),
    q: `${topic}에 대한 문제를 풀어보세요.`,
    options,
    a: options[0],
    format: "객관식" as const,
    difficulty,
    topic,
  };

  return res.status(200).json(question);
}
