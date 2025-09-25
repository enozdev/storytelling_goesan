import Image from "next/image";
import { useRouter } from "next/router";
import {
  LightBulbIcon,
  SparklesIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { useMemo, useState, type PropsWithChildren } from "react";
import { useQuizSession } from "@/store/useQuizSession";
import { HanjiBackground } from "@/components/escape-room/ui/HanjiBackground";

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

function SpeechBubble({ children }: PropsWithChildren) {
  return (
    <div className="relative inline-block rounded-2xl bg-[#fff8db] px-5 py-3 shadow-[0_10px_30px_-12px_rgba(0,0,0,.20)] border border-[#e4d6ad] anim-pulseSoft">
      <span className="font-semibold tracking-tight">{children}</span>
      <span
        aria-hidden
        className="absolute -bottom-3 left-8 w-0 h-0 border-l-8 border-r-8 border-t-[12px] border-l-transparent border-r-transparent"
        style={{ borderTopColor: "#fff8db" }}
      />
    </div>
  );
}

/** 대표 이미지 **/
function KHDCard({ src = "/kimhongdo2.png" }: { src?: string }) {
  return (
    <div
      className="relative w-full max-w-5xl rounded-3xl overflow-hidden shadow-[0_10px_30px_-12px_rgba(0,0,0,.25)] border border-[#e4d6ad] bg-white"
      style={{
        aspectRatio: "16 / 9",
        maxHeight: "100vh",
        height: "clamp(320px, 75vh, 640px)",
      }}
    >
      <div className="relative w-full h-full">
        <Image
          src={src}
          alt="김홍도(가로형) 일러스트"
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* 말풍선 */}
      <div className="absolute left-6 top-6 sm:left-64 sm:top-8 flex items-center gap-3">
        <SpeechBubble>나와 관련된 퀴즈를 만들어봐!</SpeechBubble>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const { reset } = useQuizSession();

  const handleQuizStart = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      router.push("/escape-room/questioning/quiz/create");
    }, 900);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/user/logout", { method: "POST" }).catch(() => {});
    } catch {}
    localStorage.removeItem("accessToken");
    router.push("/escape-room/user/login");
  };

  const baseBtn = useMemo(
    () =>
      "h-14 w-full rounded-2xl text-base md:text-lg font-semibold shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed",
    []
  );

  return (
    <HanjiBackground>
      {/* 페이지 전환 오버레이 */}
      {isAnimating && (
        <div className="absolute inset-0 z-50 bg-[#f8f4ea]/85 backdrop-blur-sm flex flex-col items-center justify-center anim-fadeOut">
          <SparklesIcon className="w-16 h-16 text-[#5f513d] anim-flicker" />
          <p className="mt-4 text-2xl font-bold text-[#5f513d]">
            AI 퀴즈 생성 중…
          </p>
        </div>
      )}

      {/* 헤더 */}
      <header className="relative z-10 text-center pt-10 pb-4">
        <div className="flex justify-center items-center gap-3 text-[#5f513d]">
          <PencilIcon className="w-8 h-8 anim-float text-[#5f513d]" />
          <h1 className="text-3xl font-extrabold tracking-tight">
            괴산 김홍도 QR 방탈출
          </h1>
        </div>
        <p className="text-lg text-[#5f513d]/80 mt-2">
          단원 김홍도의 수수께끼를 AI와 함께
        </p>

        {/* 먹선 구분선 */}
        <div
          className="mx-auto mt-4 w-24 h-[2px] bg-[#5f513d]/50"
          style={{ boxShadow: "0 1px 0 rgba(0,0,0,.06)" }}
        />
      </header>

      {/* 대표 카드 */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-4">
        <KHDCard src="/kimhongdo2.png" />
      </main>

      {/* 하단 버튼 바 — 화면 하단 고정 */}
      <div className="fixed bottom-10 left-0 w-full z-20 px-4 pb-6">
        <div className="mx-auto w-full max-w-3xl rounded-3xl border border-[#e4d6ad] bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-[0_10px_30px_-12px_rgba(0,0,0,.25)] p-2 md:p-4 isolate">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button
              aria-label="AI 퀴즈 생성하기"
              className={`${baseBtn} bg-[#5f513d] text-[#f8f4ea] hover:bg-[#4d4231] active:bg-[#413628] focus-visible:ring-[#5f513d] ring-1 ring-black/5`}
              onClick={handleQuizStart}
              disabled={isAnimating}
            >
              <span className="flex items-center justify-center gap-2">
                {isAnimating ? (
                  <Spinner />
                ) : (
                  <LightBulbIcon className="w-6 h-6 anim-flicker" />
                )}
                <span className={isAnimating ? "animate-pulse" : ""}>
                  AI 퀴즈 생성하기
                </span>
              </span>
            </button>

            <button
              aria-label="최근 저장 항목"
              className={`${baseBtn} bg-[#efe6ce] text-[#5f513d] hover:bg-[#e4d6ad] active:bg-[#d9c898] focus-visible:ring-[#e4d6ad]`}
              onClick={() => router.push("/escape-room/questioning/quiz/items")}
              disabled={isAnimating}
            >
              <span className="flex items-center justify-center gap-2">
                <SparklesIcon className="w-6 h-6" />
                <span>퀴즈 저장 항목</span>
              </span>
            </button>
          </div>
        </div>

        {/* 좌하단 고정 보조 버튼 */}
        <div className="fixed left-5 bottom-5 flex gap-2">
          <button
            className="px-3 py-2 rounded-lg text-base font-semibold bg-white/90 border border-[#e4d6ad] text-[#5f513d] hover:bg-white shadow"
            onClick={handleLogout}
            aria-label="로그아웃"
          >
            로그아웃
          </button>
          <button
            className="px-3 py-2 rounded-lg text-base font-semibold bg-white/90 border border-[#e4d6ad] text-[#5f513d] hover:bg-white shadow"
            onClick={() => router.push("/escape-room")}
          >
            수업 페이지로
          </button>
        </div>
      </div>

      {/* 전용 스타일 */}
      <style jsx global>{`
        @keyframes fadeOut {
          to {
            opacity: 0;
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes flicker {
          0%,
          100% {
            opacity: 1;
          }
          40% {
            opacity: 0.85;
          }
          45% {
            opacity: 1;
          }
          50% {
            opacity: 0.9;
          }
          55% {
            opacity: 1;
          }
          60% {
            opacity: 0.92;
          }
        }
        @keyframes wink {
          0%,
          100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(-4deg);
          }
        }
        @keyframes pulseSoft {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
        }
        .anim-fadeOut {
          animation: fadeOut 1.2s ease forwards;
        }
        .anim-float {
          animation: float 3s ease-in-out infinite;
        }
        .anim-flicker {
          animation: flicker 2.2s linear infinite;
        }
        .anim-wink {
          animation: wink 2.4s ease-in-out infinite;
        }
        .anim-pulseSoft {
          animation: pulseSoft 2.4s ease-in-out infinite;
        }
      `}</style>
    </HanjiBackground>
  );
}
