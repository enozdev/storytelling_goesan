import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/backend/prisma";
import { Prisma } from "@prisma/client";

/** ── 요청/응답/DB Row 타입 ─────────────────────────────────────────────── */
type RequestBody = { user_id?: string; contentsId?: number | null };

type ItemsResponse = {
  items: {
    question: {
      id: string;
      idx?: number; // 화면용 키(선택)
      topic: string;
      difficulty: string; // enum이 있다면 string 대신 유니온으로 교체
      question: string;
      options: string[];
      answer: string;
      nextLocation?: string;
      contentsId?: number | null;
    };
  }[];
};
type ErrorResponse = { error: string };

type DBQuestionRow = Prisma.QuestionGetPayload<{
  select: {
    idx: true;
    topic: true;
    difficulty: true;
    question: true;
    answer: true;
    options: true;
    nextLocation: true;
    contentsId: true;
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

    const { user_id, contentsId } = (req.body ?? {}) as RequestBody;
    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    // 1) 최신 7건(내림차순) 조회
    const rows: DBQuestionRow[] = await prisma.question.findMany({
      where: { userId: user_id, contentsId: contentsId ?? undefined },
      orderBy: { idx: "desc" },
      take: 7,
      select: {
        idx: true,
        topic: true,
        difficulty: true,
        question: true,
        answer: true,
        options: true,
        nextLocation: true, // Escape Room 전용
        contentsId: true, // Escape Room 전용
      },
    });

    // 2) 가져온 7건만 오름차순(가장 먼저 생성된 순)으로 재정렬
    const rowsAsc = rows.slice().sort((a, b) => Number(a.idx) - Number(b.idx));

    // 3) 응답 매핑 (idx/옵션 정규화 포함)
    const items: ItemsResponse["items"] = rowsAsc
      .filter((r) => !!r.question && !!r.answer)
      .map((r) => ({
        question: {
          id: String(r.idx),
          idx: Number(r.idx), // 프론트에서 안정적 키로 사용 가능
          topic: String(r.topic ?? ""),
          difficulty: String(r.difficulty ?? "medium"),
          question: String(r.question),
          options: toStringArray(r.options as unknown),
          answer: String(r.answer),
          nextLocation: r.nextLocation ?? undefined,
          contentsId: r.contentsId ?? null,
        },
      }));

    return res.status(200).json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
