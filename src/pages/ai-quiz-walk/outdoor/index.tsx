import Image from "next/image";
import { useRouter } from "next/router";
import { MapPinIcon, KeyIcon, TrophyIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import { useQuizSession } from "@/store/useQuizSession";

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        opacity="0.25"
      />
      <path d="M22 12a10 10 0 0 1-10 10" fill="currentColor" />
    </svg>
  );
}

export default function AiQuizWalkHome() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const { reset } = useQuizSession();

  const handleQuizStart = () => {
    setTimeout(() => {
      router.push("/ai-quiz-walk/outdoor/scan");
    }, 1200);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/user/logout", { method: "POST" }).catch(() => {});
    } catch {}
    localStorage.removeItem("accessToken");
    router.push("/ai-quiz-walk/user/login");
  };

  const baseBtn = useMemo(
    () =>
      "h-14 w-full rounded-2xl text-base md:text-lg font-semibold shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed",
    []
  );

  return (
    <div className="min-h-screen bg-amber-50 text-stone-800 relative flex flex-col">
      {/* 배경 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(180deg, rgba(245,222,179,0.28), rgba(255,255,255,0.6))",
          backgroundSize: "12px 12px, 100% 100%",
          backgroundPosition: "0 0, 0 0",
        }}
      />

      {/* 헤더 */}
      <header className="relative z-10 px-4 pt-6 pb-2 text-center">
        <div className="mx-auto max-w-2xl flex items-center justify-center gap-2 text-amber-900">
          <MapPinIcon className="w-7 h-7 animate-compass" />
          <h1 className="text-2xl font-black md:text-3xl">
            괴산 산막이 옛길 보물퀴즈
          </h1>
        </div>
        <p className="text-sm md:text-base text-stone-600 mt-1">
          산막이 옛길을 탐험하며 퀴즈를 풀어 보세요.
        </p>
      </header>

      {/* 메인 */}
      <main className="relative z-10 w-full flex-1 px-4">
        <div className="mx-auto max-w-md w-full">
          {/* 세로형 이미지 */}
          <div className="relative w-full h-[59vh] min-h-[300px] rounded-3xl overflow-hidden shadow-xl ring-1 ring-black/5">
            <Image
              src="/goesan_outdoor.png"
              alt="산막이 옛길 퀴즈 풀기"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 420px"
              style={{ objectFit: "cover" }}
            />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="rounded-2xl bg-gradient-to-t from-amber-900/70 to-amber-700/70 p-4">
                <p className="text-amber-50 text-sm leading-snug">
                  QR을 찾아 산막이 옛길을 돌아다녀 보세요.
                </p>
              </div>
            </div>
          </div>

          <section className="mt-4 space-y-2" aria-label="플레이 가이드">
            <div className="rounded-2xl bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 p-3 shadow ring-1 ring-black/5">
              <p className="text-sm leading-relaxed">
                제한 시간 내 더 많은 퀴즈를 맞춰보세요!
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* 하단 고정 액션바 */}
      <nav className="relative z-20">
        <div className="mx-auto max-w-md w-full px-4 pb-4">
          <div className="rounded-3xl border border-amber-100 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-xl p-3 isolate">
            <div className="grid grid-cols-1 gap-2">
              <button
                aria-label="보물 퀴즈 시작"
                className={`${baseBtn} bg-amber-700 text-amber-50 hover:bg-amber-800 active:bg-amber-900 focus-visible:ring-amber-700 shadow-xl ring-1 ring-black/5`}
                onClick={handleQuizStart}
                disabled={isAnimating}
              >
                <span className="flex items-center justify-center gap-2">
                  {isAnimating ? <Spinner /> : <KeyIcon className="w-6 h-6" />}
                  <span className={isAnimating ? "animate-pulse-soft" : ""}>
                    QR 찾기 시작
                  </span>
                </span>
              </button>

              <button
                aria-label="랭킹 보기"
                className={`${baseBtn} bg-amber-100 text-amber-900 hover:bg-amber-200 active:bg-amber-300 focus-visible:ring-amber-400`}
                onClick={() => router.push("/ai-quiz-walk/outdoor/rank")}
                disabled={isAnimating}
              >
                <span className="flex items-center justify-center gap-2">
                  <TrophyIcon className="w-6 h-6" />
                  <span>랭킹 보기</span>
                </span>
              </button>
            </div>

            {/* 하단 버튼 */}
            <div className="mt-3 flex items-center justify-between text-sm">
              <button
                className="px-3 py-2 rounded-lg font-semibold bg-stone-200 text-stone-700 hover:bg-stone-300 transition shadow"
                onClick={handleLogout}
                aria-label="로그아웃"
              >
                로그아웃
              </button>
              <button
                className="px-3 py-2 rounded-lg font-semibold bg-stone-200 text-stone-700 hover:bg-stone-300 transition shadow"
                onClick={() => router.push("/ai-quiz-walk")}
              >
                수업 페이지로
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
