// 모든 퀴즈 세트와 퀴즈를 가져오는 API

import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/backend/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const quizzes = await prisma.quizSet.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        quizzes: {
          orderBy: {
            questionOrder: "asc",
          },
        },
      },
    });
    if (!quizzes) {
      return res.status(404).json({ message: "No quizzes found" });
    }
    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
