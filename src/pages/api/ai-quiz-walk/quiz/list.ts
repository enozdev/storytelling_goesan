import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";
import type { SessionQuestion, Difficulty } from "@/lib/frontend/quiz/types";

// PrismaClient 싱글턴 (개발 환경 커넥션 누수 방지)
const prisma = (globalThis as any).prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = prisma;

// Json/문자열/배열 어떤 형태여도 string[]로 정규화
const toStringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return v.trim() ? [v] : [];
    }
  }
  if (typeof v === "object" && v !== null) {
    try {
      const serialized = JSON.stringify(v);
      const parsed = JSON.parse(serialized);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { user_id } = req.body as { user_id?: string };
    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const rows = await prisma.question.findMany({
      where: { userId: user_id },
      orderBy: { createdAt: "desc" },
      take: 7,
      select: {
        idx: true,
        topic: true,
        difficulty: true,
        question: true,
        answer: true,
        options: true, // Json / TEXT[] / JSON 문자열 등
      },
    });

    // SessionQuestion[]으로 계약 맞춰 매핑
    const items: SessionQuestion[] = rows
      .filter((r: { question: any; answer: any }) => !!r.question && !!r.answer)
      .map(
        (r: {
          idx: any;
          topic: any;
          difficulty: unknown;
          question: any;
          answer: any;
        }) => ({
          question: {
            id: String(r.idx),
            topic: String(r.topic),
            difficulty: String(r.difficulty),
            question: String(r.question),
            options: toStringArray((r as any).options),
            answer: String(r.answer),
          },
        })
      );

    return res.status(200).json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
