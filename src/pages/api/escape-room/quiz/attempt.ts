import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/backend/prisma";
import { privateAuth } from "@/lib/backend/privateAuth";

import type { AuthOK, AuthFail } from "@/lib/backend/auth/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST")
      return res.status(405).json({ error: "Method Not Allowed" });

    const a = privateAuth(req) as AuthOK | AuthFail;
    if (!a.success)
      return res
        .status(a.code ?? 401)
        .json({ errorCode: a.errorCode ?? "E1000", error: a.error });

    const { questionId, selected } = (req.body ?? {}) as {
      questionId?: number;
      selected?: string;
    };
    if (!Number.isInteger(Number(questionId)) || !selected) {
      return res.status(400).json({ error: "invalid payload" });
    }

    const q = await prisma.question.findUnique({
      where: { idx: Number(questionId) },
    });
    if (!q) return res.status(404).json({ error: "question not found" });

    // ⚠ 문제 소유 팀(B팀) 확인
    const ownerTeamId = Number(q.userId);
    if (Number.isFinite(ownerTeamId) && ownerTeamId === a.idx) {
      // 자기 팀 문제는 집계 제외
      const correctCount = await prisma.quizAttempt.count({
        where: { teamId: a.idx, correct: true },
      });
      return res.status(200).json({
        ok: true,
        ignored: true,
        reason: "self",
        correct: false,
        correctCount,
        token: a.token,
      });
    }

    const isCorrect = q.answer === selected;
    const id = `${a.idx}:${q.idx}`; // 단일 PK(팀×문제 1회)

    await prisma.quizAttempt.upsert({
      where: { id },
      update: {}, // 첫 시도만 인정 (오답→정답 승격 허용하려면: update: { correct: true, selected } )
      create: {
        id,
        teamId: a.idx,
        questionIdx: q.idx,
        selected,
        correct: isCorrect,
      },
    });

    const correctCount = await prisma.quizAttempt.count({
      where: { teamId: a.idx, correct: true },
    });

    return res
      .status(200)
      .json({ ok: true, correct: isCorrect, correctCount, token: a.token });
  } catch (err: any) {
    console.error("[quiz/attempt] fatal", err);
    return res
      .status(500)
      .json({ error: "internal", message: String(err?.message ?? err) });
  }
}
