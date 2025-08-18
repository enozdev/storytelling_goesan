// // pages/api/user/question/list.ts
// import type { NextApiRequest, NextApiResponse } from "next";
// import { PrismaClient } from "@prisma/client";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "../auth/[...nextauth]"; // ← 실제 경로로 조정

// const prisma = new PrismaClient();

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "GET")
//     return res.status(405).json({ error: "Method Not Allowed" });

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user) return res.status(401).json({ error: "Unauthorized" });

//   const userId = (session.user as any).id ?? session.user.email;
//   if (!userId) return res.status(400).json({ error: "사용자 식별 불가" });

//   const rows = await prisma.question.findMany({
//     where: { userId },
//     orderBy: { id: "desc" },
//     select: {
//       id: true,
//       topic: true,
//       difficulty: true,
//       q: true,
//       options: true,
//       answer: true,
//       validUntil: true,
//     },
//   });

//   return res.status(200).json(rows);
// }
