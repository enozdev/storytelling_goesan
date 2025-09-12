// pages/api/ai-quiz-walk/quiz/qr/scan.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/backend/prisma";
import { privateAuth } from "@/lib/backend/privateAuth";

import type { AuthOK, AuthFail } from "@/lib/backend/auth/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log("[prisma models]", Object.keys(prisma as any));
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // 인증 (Bearer 또는 privateAuth가 허용하는 헤더 형태)
    const a = privateAuth(req) as AuthOK | AuthFail;
    if (!a.success) {
      return res
        .status(a.code ?? 401)
        .json({ errorCode: a.errorCode ?? "E1000", error: a.error });
    }

    // Body 검증
    const { qrId } = (req.body ?? {}) as { qrId?: string | number };
    const qid = Number(qrId);
    if (!Number.isInteger(qid)) {
      return res.status(400).json({ error: "qrId must be integer", qrId });
    }

    // 문제 조회
    const q = await prisma.question.findUnique({ where: { idx: qid } });
    if (!q) {
      return res.status(404).json({ error: "question not found", id: qid });
    }

    // A팀(풀이자) vs B팀(제작자) 판별: Question.userId(String) → 숫자 파싱
    const ownerTeamId = Number(q.userId);
    if (Number.isFinite(ownerTeamId) && ownerTeamId === a.idx) {
      // 자기 팀 문제면 집계 제외
      const foundCount = await prisma.quizScan.count({
        where: { teamId: a.idx },
      });
      return res.status(200).json({
        ok: true,
        ignored: true,
        reason: "self",
        foundCount,
        token: a.token,
      });
    }

    // 단일키 upsert: id = `${teamId}:${questionId}`
    const id = `${a.idx}:${qid}`;
    await prisma.quizScan.upsert({
      where: { id },
      update: {}, // 1회만 인정
      create: { id, teamId: a.idx, qrId: String(qid) },
    });

    const foundCount = await prisma.quizScan.count({
      where: { teamId: a.idx },
    });
    console.log("[scan] payload", {
      teamId: a.success ? a.idx : null,
      qrId,
      qid,
    });

    return res.status(200).json({ ok: true, foundCount, token: a.token });
  } catch (err: any) {
    console.error("[quiz/qr/scan] fatal", err);
    if (err?.code) {
      console.error("[scan] prisma-error", err.code, err.meta);
    }
    return res.status(500).json({
      error: "internal",
      message: String(err?.message ?? err),
    });
  }
}
