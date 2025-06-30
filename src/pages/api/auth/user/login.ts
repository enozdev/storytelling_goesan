import { signAccessToken, signRefreshToken } from "@/lib/backend/jwt";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt, { compare } from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { ref } from "process";

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

  const { userTeamName, userTeamPassword } = req.body;
  if (!userTeamName || !userTeamPassword) {
    return res.status(400).json({
      success: false,
      errorCode: "E0003",
      error: "요청 본문에 필수 입력값이 누락되었습니다.",
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { userTeamName: userTeamName },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        errorCode: "E0005",
        error: "리소스를 찾을 수 없습니다.",
      });
    }

    const isPasswordValid = await compare(
      userTeamPassword,
      user.userTeamPassword
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        errorCode: "E0006",
        error: "비밀번호가 일치하지 않습니다.",
      });
    }

    const now = new Date();

    const accessToken = signAccessToken({ userTeamName });
    const refreshToken = signRefreshToken({ userTeamName });

    await prisma.user.update({
      where: { idx: user.idx },
      data: {
        access_at: now,
      },
    });

    return res.status(200).json({
      success: true,
      accessToken,
      userTeamName,
      userTeamCreatedAt: now.toISOString(),
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
