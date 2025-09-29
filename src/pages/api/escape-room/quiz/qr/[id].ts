import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/backend/prisma";
import { privateAuth } from "@/lib/backend/privateAuth";

import type { AuthOK, AuthFail } from "@/lib/backend/auth/types";
import next from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET")
      return res.status(405).json({ error: "Method Not Allowed" });

    const raw = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const idx = Number(raw);
    if (!Number.isInteger(idx))
      return res.status(400).json({ error: "invalid id", raw });

    const q = await prisma.question.findUnique({ where: { idx } });
    if (!q)
      return res.status(404).json({ error: "question not found", id: idx });

    // 저자 팀명 구하기
    let authorTeamName = "제작자 미상";
    const ownerTeamId = Number(q.userId);
    if (Number.isFinite(ownerTeamId)) {
      const author = await prisma.user.findUnique({
        where: { idx: ownerTeamId },
        select: { userTeamName: true },
      });
      authorTeamName = author?.userTeamName ?? "제작자 미상";
    }

    //  뷰어 팀명 = 스캐너/풀이자
    let viewerTeamName = "게스트";
    let token: string | undefined;
    try {
      const a = privateAuth(req) as AuthOK | AuthFail;
      if ("success" in a && a.success) {
        const u = await prisma.user.findUnique({
          where: { idx: a.idx },
          select: { userTeamName: true },
        });
        viewerTeamName = u?.userTeamName ?? "게스트";
        token = a.token;
      }
    } catch {
      /* 게스트 허용 */
    }

    // options(Json) 안전 직렬화
    const safeOptions = JSON.parse(JSON.stringify(q.options ?? []));

    return res.status(200).json({
      authorTeamName,
      // ↔ 기존 호환 필드(뷰어)
      teamName: viewerTeamName,
      userTeamName: viewerTeamName,
      token,
      question: {
        id: q.idx,
        topic: q.topic,
        difficulty: q.difficulty,
        q: q.question,
        options: safeOptions,
        a: q.answer,
        nextLocation: q.nextLocation,
      },
    });
  } catch (err: any) {
    console.error("[quiz/qr] fatal", err);
    return res
      .status(500)
      .json({ error: "internal", message: String(err?.message ?? err) });
  }
}
