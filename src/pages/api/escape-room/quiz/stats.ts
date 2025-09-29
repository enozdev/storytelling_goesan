import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/backend/prisma";
import { privateAuth } from "@/lib/backend/privateAuth";
import type { AuthOK, AuthFail } from "@/lib/backend/auth/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET")
      return res.status(405).json({ error: "Method Not Allowed" });

    const a = privateAuth(req) as AuthOK | AuthFail;
    if (!a.success)
      return res
        .status(a.code ?? 401)
        .json({ errorCode: a.errorCode ?? "E1000", error: a.error });

    const [foundCount, correctCount, u] = await Promise.all([
      prisma.quizScan.count({ where: { teamId: a.idx } }),
      prisma.quizAttempt.count({ where: { teamId: a.idx, correct: true } }),
      prisma.user.findUnique({ where: { idx: a.idx } }),
    ]);

    const teamName = u?.userTeamName ?? "게스트";
    return res.status(200).json({
      ok: true,
      teamName,
      userTeamName: teamName,
      foundCount,
      correctCount,
      token: a.token,
    });
  } catch (err: any) {
    console.error("[quiz/stats] fatal", err);
    return res
      .status(500)
      .json({ error: "internal", message: String(err?.message ?? err) });
  }
}
