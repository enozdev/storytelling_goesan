import jwt from "jsonwebtoken";
import { NextApiRequest } from "next";

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_EXPIRES_TIME = 4 * 60 * 60;
const TOKEN_RENEW_TIME = 60 * 60;

export function privateAuth(req: NextApiRequest) {
  const auth_header = req.headers.authorization;

  if (!auth_header || !auth_header.startsWith("Bearer ")) {
    return {
      success: false,
      code: 401,
      errorCode: "E1000",
      error: "로그인이 필요합니다.",
    };
  }

  try {
    const token = auth_header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as {
      adminId: number;
      role: string;
      exp: number;
      idx: number;
    };

    const now = Math.floor(Date.now() / 1000);
    const remaining = decoded.exp - now;

    let newToken: string | undefined;

    if (remaining < TOKEN_RENEW_TIME) {
      newToken = jwt.sign(
        { adminId: decoded.adminId, role: decoded.role, idx: decoded.idx },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRES_TIME }
      );
    }

    return {
      success: true,
      adminId: decoded.adminId,
      role: decoded.role,
      idx: decoded.idx,
      token: newToken,
    };
  } catch {
    return {
      success: false,
      code: 401,
      errorCode: "E1002",
      error: "유효하지 않은 토큰입니다.",
    };
  }
}
