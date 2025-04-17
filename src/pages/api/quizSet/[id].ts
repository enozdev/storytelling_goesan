import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  try {
    const quizSet = await prisma.quizSet.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        quizzes: {
          orderBy: {
            questionOrder: "asc",
          },
        },
      },
    });

    if (!quizSet) {
      return res.status(404).json({ error: "Quiz set not found" });
    }

    res.status(200).json(quizSet);
  } catch (error) {
    console.error("Error fetching quiz set:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
