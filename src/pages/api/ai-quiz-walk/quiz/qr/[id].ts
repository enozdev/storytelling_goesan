// // pages/api/ai-quiz-walk/quiz/by-id/[id].ts
// import type { NextApiRequest, NextApiResponse } from "next";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const { idx } = req.query;
//   const num = Number(idx);
//   if (!Number.isFinite(num))
//     return res.status(400).json({ error: "잘못된 요청" });

//   const q = await prisma.question.findUnique({ where: { idx: num } });
//   if (!q) return res.status(404).json({ error: "존재하지 않음" });

//   // 정책: 최소 1개월 유지 → 만료 전 해지 금지(운영), 만료 체크는 안내/차단 중 선택
//   if (q.isRevoked || new Date() > q.validUntil) {
//     return res.status(410).json({ error: "만료 또는 해지" });
//   }

//   return res.status(200).json({
//     topic: q.topic,
//     difficulty: q.difficulty,
//     q: q.q,
//     options: q.options,
//     a: q.answer,
//     id: q.idx,
//   });
// }
