import Image from "next/image";
import { useRouter } from "next/router";
import {
  CpuChipIcon,
  LightBulbIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleQuizStart = () => {
    setIsAnimating(true);
    setTimeout(() => {
      router.push("/ai-quiz-walk/indoor/quiz/create");
    }, 1500);
  };

  return (
    <div className="h-screen bg-white relative overflow-hidden flex flex-col justify-between px-4 pt-12 pb-6 text-gray-800">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 z-0 bg-cover bg-center opacity-10" />

      {/* 애니메이션 오버레이 */}
      {isAnimating && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center animate-fadeOut">
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
      <main className="relative z-10 w-full flex-grow flex flex-col items-center justify-center mb-6">
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

      {/* 버튼 영역 */}
      <footer className="relative w-full space-y-2">
        {/* AI 퀴즈 버튼 */}
        <button
          className="w-full py-3 bg-green-600 text-white rounded-2xl text-xl font-bold shadow-lg hover:bg-green-700 transition flex items-center justify-center gap-3"
          onClick={handleQuizStart}
        >
          <LightBulbIcon className="w-6 h-6 text-neon-yellow animate-flicker" />
          <span className={isAnimating ? "animate-pulse" : ""}>
            AI 퀴즈 생성하기
          </span>
        </button>
        <button
          className="w-full py-3 bg-gray-200 text-gray-800 rounded-2xl text-xl font-bold shadow-lg hover:bg-gray-300 transition flex items-center justify-center gap-3"
          onClick={() => router.push("/ai-quiz-walk/indoor/quiz/list")}
        >
          <SparklesIcon className="w-6 h-6 text-gray-600" />
          <span>저장된 문제 보기</span>
        </button>
      </footer>
    </div>
  );
}
