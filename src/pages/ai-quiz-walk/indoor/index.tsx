import Image from "next/image";
import { useRouter } from "next/router";
import {
  CpuChipIcon,
  LightBulbIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
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

export default function Home() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const { reset } = useQuizSession();

  const handleQuizStart = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      router.push("/ai-quiz-walk/indoor/quiz/create");
    }, 1500);
  };

  // 버튼 공통 클래스 (일관된 높이/라운드/포커스)
  const baseBtn = useMemo(
    () =>
      "h-14 w-full rounded-2xl text-base md:text-lg font-semibold shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed",
    []
  );

  return (
    <div className="min-h-screen bg-white relative flex flex-col px-4 pt-12 pb-6 text-gray-800">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 z-0 bg-cover bg-center opacity-10" />

      {/* 애니메이션 오버레이 */}
      {isAnimating && (
        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-fadeOut">
          <SparklesIcon className="w-16 h-16 text-green-600 animate-pulse" />
          <p className="mt-4 text-2xl font-bold text-green-700 animate-bounce">
            AI 퀴즈 생성하러 가는 중...
          </p>
        </div>
      )}

      {/* 헤더 */}
      <header className="relative z-10 text-center mb-6">
        <div className="flex justify-center items-center gap-3 text-green-800">
          <CpuChipIcon className="w-8 h-8" />
          <h1 className="text-3xl font-extrabold">괴산 산막이 옛길 퀴즈</h1>
        </div>
        <p className="text-lg text-gray-600 mt-2">
          AI와 함께하는 산막이 옛길 탐방 퀴즈
        </p>
      </header>

      {/* 대표 이미지 */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center mb-6">
        <div className="w-full max-w-2xl h-64 rounded-2xl overflow-hidden shadow-lg relative mb-4">
          <Image
            src="/goesan_image.png"
            alt="산막이 옛길 대표 이미지"
            fill
            style={{ objectFit: "cover" }}
            priority
            sizes="(max-width: 768px) 100vw, 700px"
          />
        </div>

        <div className="w-full max-w-2xl mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg relative">
          <Image
            src="/map.png"
            alt="산막이 옛길 이미지"
            width={700}
            height={300}
            style={{ objectFit: "cover", width: "100%", height: "250px" }}
            priority
          />
        </div>
      </main>

      {/* 하단 버튼 바 */}
      <div className="relative z-20">
        <div className="mx-auto w-full max-w-2xl rounded-3xl border border-gray-100 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-xl p-3 md:p-4 isolate overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              aria-label="AI 퀴즈 생성하기"
              className={`${baseBtn} bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus-visible:ring-green-600 shadow-xl ring-1 ring-black/5`}
              onClick={handleQuizStart}
              disabled={isAnimating}
            >
              <span className="flex items-center justify-center gap-2">
                {isAnimating ? (
                  <Spinner />
                ) : (
                  <LightBulbIcon className="w-6 h-6 text-neon-yellow animate-flicker" />
                )}
                <span className={isAnimating ? "animate-pulse" : ""}>
                  AI 퀴즈 생성하기
                </span>
              </span>
            </button>

            <button
              aria-label="최근 저장 항목"
              className={`${baseBtn} bg-blue-200 text-gray-900 hover:bg-blue-300 active:bg-blue-400 focus-visible:ring-blue-500`}
              onClick={() =>
                router.push("/ai-quiz-walk/indoor/quiz/savedItems")
              }
              disabled={isAnimating}
            >
              <span className="flex items-center justify-center gap-2">
                <SparklesIcon className="w-6 h-6" />
                <span>최근 저장 항목</span>
              </span>
            </button>

            <button
              aria-label="임시 저장 항목"
              className={`${baseBtn} bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 focus-visible:ring-gray-400`}
              onClick={() =>
                router.push("/ai-quiz-walk/indoor/quiz/draftItems")
              }
              disabled={isAnimating}
            >
              <span className="flex items-center justify-center gap-2">
                <span>임시 저장 항목</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
