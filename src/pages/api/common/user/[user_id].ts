import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      errorCode: "E0003",
      error: "허용되지 않은 메서드입니다.",
    });
  }

  const { private_key } = req.body;
  if (!private_key || private_key !== process.env.PRIVATE_KEY) {
    return res.status(401).json({
      success: false,
      errorCode: "E0001",
      error: "유효하지 않은 접근입니다.",
    });
  }

  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({
      success: false,
      errorCode: "E0002",
      error: "올바른 쿼리 파라미터가 필요합니다.",
    });
  }

  try {
    const userId = Array.isArray(user_id)
      ? parseInt(user_id[0])
      : user_id
      ? parseInt(user_id)
      : NaN;
    // 인덱스 가져오기
    const user = await prisma.user.findFirst({
      where: {
        idx: userId,
      },
      select: {
        idx: true,
        group: true,
        userTeamName: true,
        access_at: true, // 최근 접속 시간
        created_at: true, // 가입 날짜
      },
    });

    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(400).json({
        success: false,
        errorCode: "E0005",
        error: "리소스를 찾을 수 없습니다.",
      });
    }
  } catch (error) {
    console.error("유저 정보 조회중 오류 발생 : ", error);
    return res.status(500).json({
      success: false,
      errorCode: "E0999",
      error: "네트워크 오류가 발생했습니다.",
    });
  }
}
