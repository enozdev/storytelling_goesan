// 가장 최근 퀴즈 세트를 가져오는 API

import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/backend/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const latestQuizSet = await prisma.quizSet.findFirst({
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

    if (!latestQuizSet) {
      return res.status(200).json(null);
    }

    return res.status(200).json(latestQuizSet);
  } catch (error) {
    console.error("Error fetching latest quiz:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
