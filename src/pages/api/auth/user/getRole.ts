import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/backend/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      errorCode: "E0002",
      error: "허용되지 않은 메서드입니다.",
    });
  }

  const { idx } = req.body ?? {};
  if (typeof idx !== "number") {
    return res.status(400).json({
      success: false,
      errorCode: "E0010",
      error: "잘못된 요청입니다. 사용자 식별자가 필요합니다.",
    });
  }

  try {
    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { idx },
      select: { role: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        errorCode: "E0005",
        error: "리소스를 찾을 수 없습니다.",
      });
    }

    return res.status(200).json({
      success: true,
      role: user.role || "USER",
    });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return res.status(500).json({
      success: false,
      errorCode: "E9999",
      error: "서버 오류가 발생했습니다.",
    });
  }
}
