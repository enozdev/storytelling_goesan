import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { NextApiRequest, NextApiResponse } from "next";
import { db1 } from "@/lib/db1Client";
import bcrypt, { compare } from "bcrypt";

const SALT_ROUNDS = 10;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userTeamName, userTeamPassword } = req.body;
  if (!userTeamName || !userTeamPassword) {
    return res
      .status(400)
      .json({ error: "팀 이름과 비밀번호를 입력해주세요." });
  }

  const user = await db1.user.findFirst({
    where: { userTeamName: userTeamName },
  });

  if (!user) {
    return res.status(404).json({ error: "해당 팀이 존재하지 않습니다." });
  }

  const isPasswordValid = await compare(
    userTeamPassword,
    user.userTeamPassword
  );
  if (!isPasswordValid) {
    return res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });
  }

  const now = new Date();

  try {
    await db1.user.update({
      where: { idx: user.idx },
      data: {
        access_at: now,
      },
    });
  } catch (error) {
    console.error("접속날짜 생성 실패", error);
  }

  const accessToken = signAccessToken({ userTeamName });
  const refreshToken = signRefreshToken({ userTeamName });

  return res.status(200).json({
    success: true,
    accessToken,
    refreshToken,
    userTeamName,
    userTeamCreatedAt: now.toISOString(),
  });
}
