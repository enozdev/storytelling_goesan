// pages/api/public/questions/[publicId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method Not Allowed" });
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "invalid id" });
    }

    const idxNumber = Array.isArray(id) ? Number(id[0]) : Number(id);
    if (isNaN(idxNumber)) {
      return res.status(400).json({ error: "invalid id" });
    }

    const q = await prisma.question.findUnique({
      where: { idx: idxNumber },
      select: {
        idx: true,
        topic: true,
        difficulty: true,
        question: true,
        options: true,
        answer: true,
        createdAt: true,
      },
    });

    if (!q) return res.status(404).json({ error: "not found" });

    return res.status(200).json({
      question: q,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server error" });
  }
}
