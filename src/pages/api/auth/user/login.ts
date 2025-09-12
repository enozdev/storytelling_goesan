// /pages/api/auth/login.ts (예시 경로)
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import prisma from "@/lib/backend/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/backend/jwt";

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

  const { userTeamName, userTeamPassword } = req.body ?? {};
  if (!userTeamName || !userTeamPassword) {
    return res.status(400).json({
      success: false,
      errorCode: "E0003",
      error: "필수 입력값이 누락되었습니다.",
    });
  }

  try {
    const user = await prisma.user.findFirst({ where: { userTeamName } });
    if (!user) {
      return res.status(404).json({
        success: false,
        errorCode: "E0005",
        error: "리소스를 찾을 수 없습니다.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
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
    await prisma.user.update({
      where: { idx: user.idx },
      data: { access_at: now },
    });

    // 토큰 payload에 팀 PK(idx) 포함
    const payload = { idx: user.idx, role: user.role ?? "USER" };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      idx: user.idx,
      teamName: user.userTeamName,
      role: user.role ?? "USER",
      accessAt: now.toISOString(),
    });
  } catch (error) {
    console.error("[auth/login] fatal:", error);
    return res.status(500).json({
      success: false,
      errorCode: "E9999",
      error: "서버 오류가 발생했습니다.",
    });
  }
}
