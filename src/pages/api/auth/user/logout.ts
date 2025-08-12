import { NextApiRequest, NextApiResponse } from "next";

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
    localStorage.removeItem("accessToken");
    localStorage.removeItem("idx");
    localStorage.removeItem("userTeamName");

    return res.status(200).json({
      success: true,
      message: "로그아웃 성공",
    });
  } catch (error) {
    console.error("로그아웃 처리 중 오류 발생:", error);
    return res.status(500).json({
      success: false,
      errorCode: "E0004",
      error: "서버 오류가 발생했습니다.",
    });
  }
}
