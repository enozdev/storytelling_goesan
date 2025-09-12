// /pages/api/ai-quiz-walk/leaderboard.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/backend/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET")
      return res.status(405).json({ error: "Method Not Allowed" });

    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 1000);
    const since = req.query.since
      ? new Date(String(req.query.since))
      : undefined;
    const until = req.query.until
      ? new Date(String(req.query.until))
      : undefined;

    const scanWhere = {
      ...(since || until
        ? {
            createdAt: {
              ...(since ? { gte: since } : {}),
              ...(until ? { lte: until } : {}),
            },
          }
        : {}),
    };
    const attemptWhere = {
      ...(since || until
        ? {
            createdAt: {
              ...(since ? { gte: since } : {}),
              ...(until ? { lte: until } : {}),
            },
          }
        : {}),
    };

    const [foundAgg, correctAgg, attemptAgg] = await Promise.all([
      prisma.quizScan.groupBy({
        by: ["teamId"],
        where: scanWhere,
        _count: { _all: true },
      }),
      prisma.quizAttempt.groupBy({
        by: ["teamId"],
        where: { ...attemptWhere, correct: true },
        _count: { _all: true },
      }),
      prisma.quizAttempt.groupBy({
        by: ["teamId"],
        where: attemptWhere,
        _count: { _all: true },
      }),
    ]);

    // 팀 집합
    const teamIds = Array.from(
      new Set([
        ...foundAgg.map((x) => x.teamId),
        ...correctAgg.map((x) => x.teamId),
        ...attemptAgg.map((x) => x.teamId),
      ])
    );

    if (teamIds.length === 0) {
      res.setHeader("Cache-Control", "no-store");
      return res
        .status(200)
        .json({ items: [], total: 0, generatedAt: new Date().toISOString() });
    }

    // 팀명 조회
    const teams = await prisma.user.findMany({
      where: { idx: { in: teamIds } },
      select: { idx: true, userTeamName: true },
    });
    const nameById = new Map(teams.map((t) => [t.idx, t.userTeamName]));

    // createdAt 기준 최근 활동 시각(선택)
    const [lastScanAgg, lastAttemptAgg] = await Promise.all([
      prisma.quizScan.groupBy({
        by: ["teamId"],
        where: scanWhere,
        _max: { createdAt: true },
      }),
      prisma.quizAttempt.groupBy({
        by: ["teamId"],
        where: attemptWhere,
        _max: { createdAt: true },
      }),
    ]);
    const lastScanById = new Map(
      lastScanAgg.map((x) => [x.teamId, x._max.createdAt])
    );
    const lastAttemptById = new Map(
      lastAttemptAgg.map((x) => [x.teamId, x._max.createdAt])
    );

    // 합치기
    const foundById = new Map(foundAgg.map((x) => [x.teamId, x._count._all]));
    const correctById = new Map(
      correctAgg.map((x) => [x.teamId, x._count._all])
    );
    const attemptById = new Map(
      attemptAgg.map((x) => [x.teamId, x._count._all])
    );

    const items = teamIds.map((teamId) => {
      const teamName = nameById.get(teamId) ?? `팀#${teamId}`;
      const foundCount = foundById.get(teamId) ?? 0;
      const correctCount = correctById.get(teamId) ?? 0;
      const attemptCount = attemptById.get(teamId) ?? 0;
      const score = correctCount * 100 + foundCount * 10;
      const lastActivity = new Date(
        Math.max(
          lastScanById.get(teamId)?.getTime() ?? 0,
          lastAttemptById.get(teamId)?.getTime() ?? 0
        )
      );
      return {
        teamId,
        teamName,
        foundCount,
        correctCount,
        attemptCount,
        score,
        lastActivity,
      };
    });

    items.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.correctCount !== a.correctCount)
        return b.correctCount - a.correctCount;
      if (b.foundCount !== a.foundCount) return b.foundCount - a.foundCount;
      return a.teamName.localeCompare(b.teamName, "ko");
    });

    const sliced = items.slice(0, limit);

    // 캐시 정책(전광판 주기적 새로고침 가정)
    res.setHeader("Cache-Control", "public, max-age=3, s-maxage=3");
    return res.status(200).json({
      items: sliced,
      total: items.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[leaderboard] fatal", err);
    return res
      .status(500)
      .json({ error: "internal", message: String(err?.message ?? err) });
  }
}
