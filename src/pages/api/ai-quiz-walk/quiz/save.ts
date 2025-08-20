// // src/pages/api/questions/saved.ts
// import type { NextApiRequest, NextApiResponse } from "next";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "GET") {
//     return res.status(405).json({ error: "Method Not Allowed" });
//   }

//   try {
//     const { userId } = req.query;
//     // userId가 있다면 사용자별, 없으면 전체 조회
//     const where = typeof userId === "string" ? { userId } : {};

//     const rows = await prisma.question.findMany({
//       where,
//       orderBy: { createdAt: "desc" },
//     });

//     // 프론트에서 쓰는 형태(SessionQuestion)로 매핑
//     const items = rows.map((r) => ({
//       question: {
//         id: r.id,
//         topic: r.topic,
//         difficulty: r.difficulty,
//         q: r.q,
//         options: r.options,
//         a: r.a,
//       },
//       userAnswer: undefined, // 저장본은 사용자 답안 보관 안 하면 비워둠
//     }));

//     return res.status(200).json({ items });
//   } catch (e: any) {
//     console.error(e);
//     return res.status(500).json({ error: "저장된 문제 조회 실패" });
//   }
// }
