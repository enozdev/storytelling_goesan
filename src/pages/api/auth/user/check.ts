import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET as string;

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

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("[/api/user/check] no bearer header:", authHeader);
    return res.status(401).json({
      success: false,
      errorCode: "E0007",
      error: "로그인이 필요합니다.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!SECRET_KEY) {
      console.error("[/api/user/check] JWT_SECRET is undefined");
      return res.status(500).json({
        success: false,
        errorCode: "E9998",
        error: "서버 설정 오류(JWT_SECRET).",
      });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    return res.status(200).json({
      success: true,
      isLoggedIn: true,
      user: decoded,
    });
  } catch (err) {
    console.error("[/api/user/check] 토큰 검증 실패:", err);
    return res.status(401).json({
      success: false,
      errorCode: "E0008",
      error: "유효하지 않은 토큰입니다.",
    });
  }
}
