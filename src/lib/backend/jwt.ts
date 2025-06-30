import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_SECRET!;

export function signAccessToken(payload: object): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "4h" });
}

export function signRefreshToken(payload: object): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "1d" });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET);
}
