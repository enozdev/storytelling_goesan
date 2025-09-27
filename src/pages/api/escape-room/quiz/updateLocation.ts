import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/backend/prisma";

type RequestBody = {
  user_id?: string;
  contentsId?: number | null;
  idx?: number; // 화면/DB의 문제 인덱스
  nextLocation?: string; // 저장할 위치
};

type SuccessResponse = {
  ok: true;
  updatedCount: number;
  nextLocation: string;
};

type ErrorResponse = { ok: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }

    const { user_id, contentsId, idx, nextLocation } = (req.body ??
      {}) as RequestBody;

    // 간단 유효성 검사
    if (!user_id)
      return res.status(400).json({ ok: false, error: "user_id is required" });
    if (typeof idx !== "number")
      return res.status(400).json({ ok: false, error: "idx must be number" });

    const clean = String(nextLocation ?? "").trim();
    if (!clean)
      return res
        .status(400)
        .json({ ok: false, error: "nextLocation is required" });

    // 업데이트 (userId + contentsId + idx 로 매칭)
    const result = await prisma.question.updateMany({
      where: {
        userId: user_id,
        idx: idx,
        ...(typeof contentsId === "number" ? { contentsId } : {}),
      },
      data: {
        nextLocation: clean,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ ok: false, error: "Question not found" });
    }

    return res.status(200).json({
      ok: true,
      updatedCount: result.count,
      nextLocation: clean,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
}
