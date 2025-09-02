import { NextApiRequest, NextApiResponse } from "next";
import { hashPassword } from "@/lib/backend/bcrypt";
import { signAccessToken, signRefreshToken } from "@/lib/backend/jwt";
import { PrismaClient } from "@prisma/client";
import bcrypt, { compare } from "bcrypt";

const prisma = new PrismaClient();

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
    const existingUser = await prisma.user.findFirst({
      where: { userTeamName: userTeamName },
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        errorCode: "E0004",
        error: "중복된 리소스가 존재합니다.",
      });
    }
    // 비밀번호 해싱
    const hashedPassword = await hashPassword(userTeamPassword);

    // 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        userTeamName: userTeamName,
        userTeamPassword: hashedPassword,
        access_at: new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      user: {
        user_id: newUser.idx,
        userTeamName: newUser.userTeamName,
        createdAt: newUser.created_at,
      },
    });
  } catch (error) {
    console.error("사용자 생성 실패", error);
    return res.status(500).json({
      success: false,
      errorCode: "E9999",
      error: "네트워크 오류가 발생했습니다.",
    });
  }
}
