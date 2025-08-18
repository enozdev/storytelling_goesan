// // pages/api/user/question/save.ts
// import type { NextApiRequest, NextApiResponse } from "next";
// import { PrismaClient } from "@prisma/client";
// import { addDays } from "date-fns";
// import { getServerSession } from "next-auth/next";

// const prisma = new PrismaClient();

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "POST")
//     return res.status(405).json({ error: "Method Not Allowed" });

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user) return res.status(401).json({ error: "Unauthorized" });

//   // 세션에서 user 식별자 추출(가장 안정적인 id → 없으면 email fallback)
//   const userId = (session.user as any).id ?? session.user.email;
//   if (!userId) return res.status(400).json({ error: "사용자 식별 불가" });

//   try {
//     const { topic, difficulty, q, options, a } = req.body ?? {};
//     if (!topic || !difficulty || !q || !Array.isArray(options) || !a) {
//       return res.status(400).json({ error: "필수 필드 누락" });
//     }

//     const saved = await prisma.question.create({
//       data: {
//         userId,
//         topic,
//         difficulty,
//         q,
//         options,
//         answer: a,
//         validUntil: addDays(new Date(), 30), // 최소 30일 유지
//         isRevoked: false,
//       },
//     });

//     return res.status(200).json({
//       idx: saved.idx,
//       publicUrl: `/ai-quiz-walk/indoor/quiz/q/${saved.idx}`,
//       validUntil: saved.validUntil,
//     });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ error: "저장 중 오류" });
//   }
// }
