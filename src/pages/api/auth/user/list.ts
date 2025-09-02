import { signAccessToken, signRefreshToken } from "@/lib/backend/jwt";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt, { compare } from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      errorCode: "E0002",
      error: "허용되지 않은 메서드입니다.",
    });
  }
  try {
    const user = await prisma.user.findMany({
      orderBy: { idx: "desc" },
      select: {
        idx: true,
        userTeamName: true,
      },
    });

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("네트워크 오류 발생:", error);
    return res.status(500).json({
      success: false,
      errorCode: "E9999",
      error: "네트워크 오류가 발생했습니다.",
    });
  }
}
