"use client";
import { useRouter } from "next/navigation"; // App Router라면 navigation 사용
import { useEffect } from "react";

export default function AiQuizWalkIndex() {
  const router = useRouter();

  const titleBase = "text-2xl font-bold tracking-tight";
  const descBase = "text-sm";
  const btnBase =
    "w-full h-14 rounded-2xl font-semibold text-base shadow-md " +
    "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 " +
    "active:scale-[0.99] transition-transform";

  const indoorEndDate = new Date("2025-09-13T00:00:00Z");
  const outdoorStartDate = new Date("2025-09-13T00:00:00Z");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isIndoorEnabled = today <= indoorEndDate;
  const isOutdoorEnabled = today >= outdoorStartDate;

  useEffect(() => {
    const checkLoginStatus = async () => {
      const isLoggedIn = await handleCheckLogin();
      if (!isLoggedIn) {
        router.push("/ai-quiz-walk/user/login");
      }
    };
    checkLoginStatus();
  }, [router]);

  const handleCheckLogin = async () => {
    const res = await fetch("/api/auth/user/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!res.ok) {
      console.error("로그인 상태 확인 실패");
      return false;
    }
    const data = await res.json();
    return !!data?.success;
  };

  // 실제 로그아웃 동작
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/user/logout", { method: "POST" }).catch(() => {});
    } catch {}
    // 클라이언트 토큰/세션 제거
    localStorage.removeItem("accessToken");
    // 로그아웃 후 로그인 페이지로 이동
    router.push("/ai-quiz-walk/user/login");
  };

  return (
    <div className="min-h-screen bg-sky-50 text-gray-900 flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-md space-y-10">
        {/* 제목 영역 */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold leading-tight text-green-700">
            괴산 산막이 옛길 <br /> AI 퀴즈 산책
          </h1>
          <p className="text-base text-gray-600">
            AI와 함께하는 몰입형 학습 경험
          </p>
        </header>

        {/* 카드 영역 */}
        <main className="space-y-10">
          {/* 실내 수업 */}
          <section
            className="
              rounded-3xl bg-white border border-green-100 shadow-sm p-5
              flex flex-col justify-between min-h-[180px]
            "
            aria-label="퀴즈 생성 실내 수업"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="currentColor"
                >
                  <path d="M4 5h16a1 1 0 0 1 1 1v9H3V6a1 1 0 0 1 1-1zm17 12H3a1 1 0 1 0 0 2h8v1a1 1 0 0 0 2 0v-1h8a1 1 0 1 0 0-2zM6 8h8v2H6V8zm0 3h5v2H6v-2z" />
                </svg>
              </span>
              <div className="flex-1">
                <h2 className={`${titleBase} text-green-800`}>
                  퀴즈 생성 실내 수업
                </h2>
                <p className={`${descBase} text-gray-600`}>
                  교실 환경에서 진행하는 AI 기반 퀴즈 활동
                </p>
              </div>
            </div>

            <div className="mt-4">
              <button
                disabled={!isIndoorEnabled}
                className={`${btnBase} ${
                  isIndoorEnabled
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                onClick={() =>
                  isIndoorEnabled && router.push("/ai-quiz-walk/indoor")
                }
              >
                {isIndoorEnabled
                  ? "시작하기"
                  : "지금은 퀴즈를 생성할 수 없습니다."}
              </button>
            </div>
          </section>

          {/* 야외 수업 */}
          <section
            className="
              rounded-3xl bg-green-50 border border-green-100 shadow-sm p-5
              flex flex-col justify-between min-h-[180px]
            "
            aria-label="산막이 옛길 야외 수업"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-green-200 text-green-800">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="currentColor"
                >
                  <path d="M12 4l-9 16h18L12 4zm0 3.9l6.2 11.1H5.8L12 7.9z" />
                </svg>
              </span>
              <div className="flex-1">
                <h2 className={`${titleBase} text-green-900`}>
                  산막이 옛길 야외 수업
                </h2>
                <p className={`${descBase} text-green-700`}>
                  자연 속에서 즐기는 위치 기반 퀴즈 탐험
                </p>
              </div>
            </div>

            <div className="mt-4">
              <button
                disabled={!isOutdoorEnabled}
                className={`${btnBase} ${
                  isOutdoorEnabled
                    ? "bg-white text-green-700 border border-green-200 hover:bg-green-50 focus:ring-green-500"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                onClick={() =>
                  isOutdoorEnabled && router.push("/ai-quiz-walk/outdoor")
                }
              >
                {isOutdoorEnabled ? "시작하기" : "다음 수업에서 만나요!"}
              </button>
            </div>
          </section>

          {localStorage.getItem("role") === "ADMIN" && (
            <section
              className="
                rounded-3xl bg-white border border-amber-200 shadow-sm p-5
                flex flex-col justify-between min-h-[160px]
              "
              aria-label="관리자 전용"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    {/* shield/cog 조합 느낌 */}
                    <path d="M12 2l7 4v5c0 5-3.5 9.74-7 11-3.5-1.26-7-6-7-11V6l7-4z" />
                  </svg>
                </span>
                <div className="flex-1">
                  <h2 className={`${titleBase} text-amber-800`}>
                    관리자 페이지
                  </h2>
                </div>
              </div>

              <div className="mt-4">
                <button
                  aria-label="관리자 페이지로 이동"
                  className={
                    `${btnBase} ` +
                    "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-600"
                  }
                  onClick={() =>
                    router.push("/ai-quiz-walk/indoor/admin/teamList")
                  }
                >
                  퀴즈 리스트 한번에 보기
                </button>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* 좌하단 고정 로그아웃 버튼 */}
      <button
        className="fixed left-5 bottom-5 px-4 py-3 rounded-lg text-base font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition shadow"
        onClick={handleLogout}
        aria-label="로그아웃"
      >
        로그아웃
      </button>
    </div>
  );
}
