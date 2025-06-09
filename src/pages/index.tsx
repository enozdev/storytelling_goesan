import Image from "next/image";
import { useRouter } from "next/router";
import { CpuChipIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleQuizStart = () => {
    setIsAnimating(true);
    setTimeout(() => {
      router.push("/quiz/createQuiz");
    }, 1500); // 애니메이션 길이 1.5초
  };

  return (
    <div className="h-screen bg-white relative overflow-hidden flex flex-col justify-between px-4 pt-12 pb-6 text-gray-800">
      {/* 배경 */}
      <div className="absolute inset-0 z-0 bg-[url('/images/bg-ai-network.png')] bg-cover bg-center opacity-10" />

      {/* 애니메이션 오버레이 */}
      {isAnimating && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center animate-fadeOut">
          <SparklesIcon className="w-16 h-16 text-green-600 animate-pulse" />
          <p className="mt-4 text-2xl font-bold text-green-700 animate-bounce">
            AI 퀴즈 생성 중...
          </p>
        </div>
      )}

      {/* 헤더 */}
      <header className="relative z-10 text-center mb-6">
        <div className="flex justify-center items-center gap-3 text-green-800">
          <CpuChipIcon className="w-8 h-8 text-green-800" />
          <h1 className="text-3xl font-extrabold">괴산 산막이 옛길 퀴즈</h1>
        </div>
        <p className="text-lg text-gray-600 mt-2">
          AI가 나만의 퀴즈를 만들어드려요
        </p>
      </header>

      {/* 이미지 */}
      <main className="relative z-10 w-full flex-grow flex items-center justify-center mb-6">
        <div className="w-full h-64 rounded-2xl overflow-hidden shadow-lg relative">
          <Image
            src="/goesan_ex2.jpg"
            alt="산막이 옛길 대표 이미지"
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
      </main>

      {/* 버튼 */}
      <footer className="relative z-10 w-full space-y-4">
        <button
          className="w-full py-4 bg-green-600 text-white rounded-2xl text-xl font-bold shadow-lg hover:bg-green-700 transition flex items-center justify-center gap-3"
          onClick={handleQuizStart}
        >
          <SparklesIcon className="w-6 h-6" />
          AI 퀴즈 생성하기
        </button>
        <button
          className="w-full py-4 border-2 border-green-600 text-green-700 rounded-2xl text-xl font-bold shadow hover:bg-green-50 transition"
          onClick={() => router.push("/quiz/scan")}
        >
          퀴즈 QR 스캔하기
        </button>
        <button
          className="w-full py-4 border-2 border-green-600 text-green-700 rounded-2xl text-xl font-bold shadow hover:bg-green-50 transition"
          onClick={() => router.push("/rank")}
        >
          랭킹보기
        </button>
        <button
          className="w-full py-4 border-2 border-gray-300 text-gray-700 bg-gray-50 rounded-2xl text-xl font-bold shadow hover:bg-gray-100 transition"
          onClick={() => router.push("/admin/login")}
        >
          로그인 / 회원가입
        </button>
      </footer>
    </div>
  );
}
