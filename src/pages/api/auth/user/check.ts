export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      errorCode: "E0002",
      error: "허용되지 않은 메서드입니다.",
    });
  }

  try {
    const prisma = new PrismaClient();
    const sessionId = req.cookies.adminSession;

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        errorCode: "E0004",
        error: "로그인이 필요합니다.",
      });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        errorCode: "E0004",
        error: "로그인이 필요합니다.",
      });
    }

    return res.status(200).json({
      success: true,
      user: session.user,
    });
  } catch (error) {
    console.error("사용자 정보 조회를 실패하였습니다.", error);
    return res.status(500).json({
      success: false,
      errorCode: "E9999",
      error: "네트워크 오류가 발생했습니다.",
    });
  }
}
