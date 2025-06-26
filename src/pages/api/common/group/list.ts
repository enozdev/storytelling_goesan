import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

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
    const prisma = new PrismaClient();
    const groups = await prisma.group.findMany({
      select: {
        idx: true,
        school: true,
      },
    });

    return res.status(200).json({
      success: true,
      group: groups,
    });
  } catch (error) {
    console.error("그룹 리스트 조회를 실패하였습니다.", error);
    return res.status(500).json({
      success: false,
      errorCode: "E9999",
      error: "네트워크 오류가 발생했습니다.",
    });
  }
}
