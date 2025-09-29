import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/backend/prisma";
import { privateAuth } from "@/lib/backend/privateAuth";
import type { AuthOK, AuthFail } from "@/lib/backend/auth/types";

/** "null"/"undefined"/공백 등을 안전하게 null 처리하고, 일반 문자열만 통과 */
const toStringOrNull = (v: unknown): string | null => {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  const l = s.toLowerCase();
  if (l === "null" || l === "undefined") return null;
  return s;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log("[prisma models]", Object.keys(prisma as any));
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // 인증
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

    // 문제 조회: nextLocation 함께 가져오기 (null 보존)
    const q = await prisma.question.findUnique({
      where: { idx: qid },
      select: { idx: true, userId: true, contentsId: true, nextLocation: true },
    });
    if (!q) {
      return res.status(404).json({ error: "question not found", id: qid });
    }

    // A팀(풀이자) vs B팀(제작자) 판별
    const ownerTeamId = Number(q.userId);
    if (Number.isFinite(ownerTeamId) && ownerTeamId === a.idx) {
      const foundCount = await prisma.quizScan.count({
        where: { teamId: a.idx },
      });
      // 제작자 본인 스캔은 집계 제외하면서도 nextLocation은 굳이 줄 필요 없음(정책에 따라 조절)
      return res.status(200).json({
        ok: true,
        ignored: true,
        reason: "self",
        foundCount,
        token: a.token,
        nextLocation: true,
      });
    }

    // 단일키 upsert: id = `${teamId}:${questionId}`
    const id = `${a.idx}:${qid}`;
    await prisma.quizScan.upsert({
      where: { id },
      update: {}, // 1회 인정
      create: { id, teamId: a.idx, qrId: String(qid) },
    });

    const nextLocation = q.nextLocation;

    try {
      // 아래 칼럼이 없으면 Prisma가 에러를 던짐 → catch로 무시
      await prisma.quizScan.update({
        where: { id },
        data: {
          // 권장 추가 칼럼
          // nextLocationSnapshot: nextLocation,
          // unlockedAt: new Date(),
        } as any,
      });
    } catch {
      // 칼럼이 없으면 그냥 패스 (스키마 미확장 환경 호환)
    }

    const foundCount = await prisma.quizScan.count({
      where: { teamId: a.idx },
    });

    console.log("[scan] payload", {
      teamId: a.success ? a.idx : null,
      qrId,
      qid,
      nextLocation: nextLocation,
    });

    // ⬇️ 클라이언트가 곧바로 저장/표시할 수 있도록 nextLocation 반환
    return res
      .status(200)
      .json({ ok: true, foundCount, token: a.token, nextLocation });
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
