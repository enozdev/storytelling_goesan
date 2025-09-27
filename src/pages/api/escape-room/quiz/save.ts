// src/pages/api/questions/saved.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/backend/prisma";

type IncomingQuestion = {
  id?: string;
  question: string; // 질문 텍스트
  options: string[];
  answer: string;
  difficulty?: string;
  topic: string;
};
type IncomingItem = {
  question: IncomingQuestion; // 실제 데이터가 여기 안에 중첩되어 옴
  userAnswer?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { userId, items, contentsId } = req.body as {
      userId?: string | null;
      items?: IncomingItem[];
      contentsId?: number;
    };

    // 사용자 검증
    if (typeof userId !== "string" || userId.trim() === "") {
      return res.status(401).json({ error: "사용자 식별 불가" });
    }

    // 목록/개수 검증
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "질문 목록이 비어있습니다." });
    }
    if (items.length < 7) {
      return res.status(400).json({ error: "최소 7개의 질문이 필요합니다." });
    }

    // 각 항목 검증
    for (const it of items) {
      const q = it?.question;
      if (!q)
        return res
          .status(400)
          .json({ error: "각 항목에 question 객체가 필요합니다." });

      if (typeof q.topic !== "string" || typeof q.question !== "string") {
        return res
          .status(400)
          .json({ error: "주제와 질문은 문자열이어야 합니다." });
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return res
          .status(400)
          .json({ error: "각 질문은 최소 2개의 옵션을 포함해야 합니다." });
      }
      if (typeof q.answer !== "string" || !q.options.includes(q.answer)) {
        return res
          .status(400)
          .json({ error: "정답은 옵션 중 하나여야 합니다." });
      }
    }

    const result = await prisma.question.createMany({
      data: items.map((it) => ({
        userId,
        topic: it.question.topic,
        difficulty: it.question.difficulty ?? "medium",
        question: it.question.question,
        options: JSON.stringify(it.question.options),
        answer: it.question.answer,
        createdAt: new Date(),
        contentsId: contentsId,
      })),
    });

    return res.status(200).json({ count: result.count });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "저장 실패" });
  }
}
