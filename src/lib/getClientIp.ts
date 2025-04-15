export function getClientIp(req: any): string {
  // 개발 환경에서 테스트용 IP
  if (process.env.NODE_ENV === "development") {
    return "127.0.0.1";
  }

  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    return realIp;
  }

  return req.socket?.remoteAddress || "unknown";
}
