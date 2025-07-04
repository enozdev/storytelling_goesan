import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const { private_key } = req.body;
  // if (!private_key || private_key !== process.env.PRIVATE_KEY) {
  //   return res.status(401).json({
  //     success: false,
  //     errorCode: "E0001",
  //     error: "유효하지 않은 접근입니다.",
  //   });
  // }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      errorCode: "E0002",
      error: "허용되지 않은 메서드입니다.",
    });
  }

  try {
    const { user_id, contents_id } = req.body;
    if (!user_id || contents_id) {
      return res.status(400).json({
        success: false,
        errorCode: "E0003",
        error: "요청 본문에 필수 입력값이 누락되었습니다.",
      });
    }
    const userId = Array.isArray(user_id)
      ? parseInt(user_id[0])
      : user_id
      ? parseInt(user_id)
      : NaN;

    // 인덱스 가져오기
    const user = await prisma.participate.findMany({
      where: {
        user_id: userId,
        contents_id: contents_id,
      },
      select: {
        idx: true,
        contents_id: true,
        user_id: true,
        file_data: true,
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    if (user) {
      return res.status(200).json({
        success: true,
        user,
      });
    } else {
      return res.status(400).json({
        success: false,
        errorCode: "E0005",
        error: "리소스를 찾을 수 없습니다.",
      });
    }
  } catch (error: any) {
    console.error("유저 참여 정보 조회중 오류 발생 : ", error);
    return res.status(500).json({
      success: false,
      errorCode: "E9999",
      error: "네트워크 오류가 발생했습니다.",
    });
  }
}
