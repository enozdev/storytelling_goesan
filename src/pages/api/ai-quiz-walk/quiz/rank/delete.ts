import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/backend/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: boolean; error?: string }>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method Not Allowed" });
  }

  try {
    // 테이블 전체 초기화
    const deleted = await prisma.quizAttempt.deleteMany({});
    const deletedScans = await prisma.quizScan.deleteMany({});
    console.log(
      `랭킹 초기화: 시도 ${deleted.count}건, 스캔 ${deletedScans.count}건 삭제`
    );

    if (deleted.count === 0) {
      return res
        .status(200)
        .json({ success: true, error: "삭제할 랭킹이 없습니다." });
    }
    if (deletedScans.count === 0) {
      return res
        .status(200)
        .json({ success: true, error: "삭제할 스캔 기록이 없습니다." });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("랭킹 삭제 오류:", error);
    return res
      .status(500)
      .json({ success: false, error: "서버 오류가 발생했습니다." });
  }
}
