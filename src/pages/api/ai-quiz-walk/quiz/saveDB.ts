// import { NextApiRequest, NextApiResponse } from "next";
// import prisma from "@/lib/backend/prisma";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method not allowed" });
//   }

//   try {
//     const {
//       quizSetId,
//       question,
//       optionA,
//       optionB,
//       optionC,
//       optionD,
//       answer,
//       questionOrder,
//       qrCode,
//     } = req.body;

//     if (
//       !quizSetId ||
//       !question ||
//       !optionA ||
//       !optionB ||
//       !optionC ||
//       !optionD ||
//       !answer ||
//       !questionOrder
//     ) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const quiz = await prisma.quiz.create({
//       data: {
//         quizSetId,
//         question,
//         optionA,
//         optionB,
//         optionC,
//         optionD,
//         answer,
//         questionOrder,
//         qrCode: qrCode || "",
//       },
//     });

//     return res.status(201).json(quiz);
//   } catch (error) {
//     console.error("Error creating quiz:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// }
