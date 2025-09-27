"use client";
import { useRouter } from "next/navigation";
import {
  PencilSquareIcon,
  QrCodeIcon,
  CameraIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

export default function AiQuizWalkIndex() {
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const isLoggedIn = await handleCheckLogin();
      if (!isLoggedIn) {
        router.push("/escape-room/user/login");
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

  const titleBase = "text-2xl font-bold tracking-tight";
  const descBase = "text-sm";
  const btnBase =
    "w-full h-14 rounded-2xl font-semibold text-base shadow-md transition " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.99]";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/user/logout", { method: "POST" }).catch(() => {});
    } catch {}
    localStorage.removeItem("accessToken");
    router.push("/escape-room/user/login");
  };

  return (
    <div className="min-h-[100dvh] bg-[#F6F1E7] text-[#3F3629] flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-md space-y-10 py-16">
        {/* 제목 영역 */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold leading-tight text-[#3F3629]">
            괴산 김홍도 QR 방탈출
          </h1>
          <p className="text-base text-[#6B604E]">
            AI와 QR로 즐기는 몰입형 학습 체험
          </p>
          <div className="mx-auto w-24 h-[2px] bg-[#3F3629]/30" />
        </header>

        {/* 카드 영역 */}
        <main className="space-y-10">
          {/* ① 퀴즈 생성 */}
          <section
            className="
              rounded-3xl bg-white border border-[#E9E2D3] shadow-[0_10px_30px_-18px_rgba(0,0,0,.25)]
              p-5 flex flex-col justify-between min-h-[180px]
            "
            aria-label="퀴즈 생성"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6E8B6D]/15 text-[#6E8B6D] ring-1 ring-[#6E8B6D]/20">
                <PencilSquareIcon className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h2 className={`${titleBase}`}>퀴즈 생성</h2>
                <p className={`${descBase} text-[#6B604E]`}>
                  AI를 사용해서 김홍도와 관련된 퀴즈를 제작해보세요.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <button
                className={`${btnBase} text-[#F6F1E7] bg-gradient-to-br from-[#3F3629] to-[#2F291F] hover:brightness-[1.06] focus:ring-[#3F3629]`}
                onClick={() => router.push("/escape-room/questioning")}
              >
                시작하기
              </button>
            </div>
          </section>

          {/* ② QR 부착 */}
          <section
            className="
    rounded-3xl bg-[#F9F7F3] border border-[#E5DED0] 
    shadow-[0_10px_30px_-18px_rgba(0,0,0,.25)]
    p-5 flex flex-col justify-between min-h-[180px]
  "
            aria-label="QR 부착"
          >
            <div className="flex items-start gap-3">
              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl 
                    bg-[#D8C6B3]/30 text-[#9C6B4E] ring-1 ring-[#D8C6B3]"
              >
                <QrCodeIcon className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h2 className={`${titleBase} text-[#3F3629]`}>QR 부착</h2>
                <p className={`${descBase} text-[#6B604E]`}>
                  직접 김홍도 QR 방탈출을 제작해보세요!
                </p>
              </div>
            </div>
            <div className="mt-4">
              <button
                className={`${btnBase} bg-[#E9DDC8] text-[#3F3629] border border-[#D8C6B3] 
                  hover:bg-[#F3EBDC] focus:ring-[#BFA06A]`}
                onClick={() => router.push("/escape-room/placing")}
              >
                방탈출 제작하기
              </button>
            </div>
          </section>

          {/* ③ QR 방탈출 */}
          <section
            className="
              rounded-3xl bg-white border border-[#E9E2D3] shadow-[0_10px_30px_-18px_rgba(0,0,0,.25)]
              p-5 flex flex-col justify-between min-h-[180px]
            "
            aria-label="QR 방탈출"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#BFA06A]/15 text-[#A98D5F] ring-1 ring-[#BFA06A]/20">
                <CameraIcon className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h2 className={`${titleBase}`}>QR 방탈출</h2>
                <p className={`${descBase} text-[#6B604E]`}>
                  칠판/장소의 QR을 스캔해 방을 탈출해보세요!
                </p>
              </div>
            </div>
            <div className="mt-4">
              <button
                className={`${btnBase} text-[#F6F1E7] bg-gradient-to-br from-[#3F3629] to-[#2F291F] hover:brightness-[1.06] focus:ring-[#3F3629]`}
                onClick={() => router.push("/escape-room/answering")}
              >
                스캔하기
              </button>
            </div>
          </section>

          {/* 관리자 전용 (옵션) */}
          {localStorage.getItem("role") === "ADMIN" && (
            <section
              className="
                  rounded-3xl bg-white border border-[#E9E2D3] shadow-[0_10px_30px_-18px_rgba(0,0,0,.25)]
                  p-5 flex flex-col justify-between min-h-[160px]
                "
              aria-label="관리자 전용"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3F3629]/10 text-[#3F3629] ring-1 ring-[#3F3629]/15">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2l7 4v5c0 5-3.5 9.74-7 11-3.5-1.26-7-6-7-11V6l7-4z" />
                  </svg>
                </span>
                <div className="flex-1">
                  <h2 className={`${titleBase}`}>관리자 페이지</h2>
                </div>
              </div>

              <div className="mt-4">
                <button
                  aria-label="관리자 페이지로 이동"
                  className={`${btnBase} bg-[#E9DDC8] text-[#3F3629] border border-[#D8C6B3] 
                  hover:bg-[#F3EBDC] focus:ring-[#BFA06A]`}
                  // onClick={() =>
                  //   router.push("/ai-quiz-walk/indoor/admin/teamList")
                  // }
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
        className="fixed left-5 bottom-5 px-4 py-3 rounded-lg text-base font-semibold bg-white/80 border border-[#E9E2D3] text-[#3F3629] hover:bg-white shadow"
        onClick={handleLogout}
        aria-label="로그아웃"
      >
        로그아웃
      </button>
    </div>
  );
}
