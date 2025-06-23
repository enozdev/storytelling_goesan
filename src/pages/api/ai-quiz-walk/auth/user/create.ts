import { NextApiRequest, NextApiResponse } from "next";
import { db1 } from "@/lib/db1Client";
import { hashPassword } from "@/lib/bcrypt";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "허용되지 않은 메서드입니다." });
  }

  const { group, userTeamName, userTeamPassword } = req.body;
  if (!userTeamName || !userTeamPassword) {
    return res.status(400).json({
      error:
        "요청 본문에 필수 입력값이 누락되었습니다. 팀 정보를 입력해주세요.",
    });
  }

  try {
    const existingUser = await db1.user.findFirst({
      where: { userTeamName: userTeamName },
    });
    if (existingUser) {
      return res.status(409).json({ error: "이미 존재하는 팀 이름입니다." });
    }
    // 비밀번호 해싱
    const hashedPassword = await hashPassword(userTeamPassword);

    // 사용자 생성
    const newUser = await db1.user.create({
      data: {
        group: group,
        userTeamName: userTeamName,
        userTeamPassword: hashedPassword,
        access_at: new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      user: {
        idx: newUser.idx,
        userTeamName: newUser.userTeamName,
        createdAt: newUser.created_at,
      },
    });
  } catch (error) {
    console.error("사용자 생성 실패", error);
    return res.status(500).json({ error: "사용자 생성에 실패했습니다." });
  }
}
