import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getClientIp } from "@/lib/getClientIp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { title, topic } = req.body;
    const clientIp = getClientIp(req);

    if (!title || !topic) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const quizSet = await prisma.quizSet.create({
      data: {
        title,
        topic,
        createdBy: clientIp,
      },
    });

    return res.status(201).json(quizSet);
  } catch (error) {
    console.error("Error creating quiz set:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
