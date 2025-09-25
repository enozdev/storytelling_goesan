import type { NextApiRequest, NextApiResponse } from "next";
import type { SessionQuestion, Difficulty } from "@/lib/frontend/quiz/types";
import prisma from "@/lib/backend/prisma";
import { Prisma } from "@prisma/client";

/** ── 요청/응답/DB Row 타입 ─────────────────────────────────────────────── */
type RequestBody = { user_id?: string };

type ItemsResponse = { items: SessionQuestion[] };
type ErrorResponse = { error: string };

type DBQuestionRow = Prisma.QuestionGetPayload<{
  select: {
    idx: true;
    topic: true;
    difficulty: true;
    question: true;
    answer: true;
    options: true;
  };
}>;

/** Json/문자열/배열 어떤 형태여도 string[]로 정규화 */
const toStringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String);

  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed.map(String) : v.trim() ? [v] : [];
    } catch {
      return v.trim() ? [v] : [];
    }
  }

  if (typeof v === "object" && v !== null) {
    try {
      // Prisma.JsonValue 같은 경우도 직렬화 후 배열이면 매핑
      const parsed = JSON.parse(JSON.stringify(v));
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }

  return [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ItemsResponse | ErrorResponse>
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { user_id } = (req.body ?? {}) as RequestBody;
    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    // 1) 최신 7건(내림차순) 조회
    const rows: DBQuestionRow[] = await prisma.question.findMany({
      where: { userId: user_id },
      orderBy: { idx: "desc" },
      take: 7,
      select: {
        idx: true,
        topic: true,
        difficulty: true,
        question: true,
        answer: true,
        options: true,
      },
    });

    // 2) 가져온 7건만 오름차순(가장 먼저 생성된 순)으로 재정렬
    const rowsAsc: DBQuestionRow[] = rows
      .slice()
      .sort((a, b) => Number(a.idx) - Number(b.idx));

    // 3) SessionQuestion[] 형태로 매핑
    const items: SessionQuestion[] = rowsAsc
      .filter((r) => !!r.question && !!r.answer)
      .map(
        (r): SessionQuestion => ({
          question: {
            id: String(r.idx),
            topic: String(r.topic ?? ""),
            difficulty: String(r.difficulty ?? "medium") as Difficulty,
            question: String(r.question),
            options: toStringArray(r.options as unknown),
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
