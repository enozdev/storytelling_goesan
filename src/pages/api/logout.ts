import { NextApiResponse, NextApiRequest } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sessionId = req.cookies.adminSession;

  if (sessionId) {
    try {
      // 세션 삭제
      await prisma.session.delete({
        where: { id: sessionId }
      });
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }

  // 쿠키 삭제
  res.setHeader('Set-Cookie', 'adminSession=; Path=/; Max-Age=0');

  return res.status(200).json({ message: "Logout successful" });
}