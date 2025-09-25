import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashApp2({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200); // 2.2초 후 화면 전환
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#fdf9f2] text-[#4b3b2a]">
        {/* 김홍도 캐릭터 (동그란 프로필 카드) */}
        <div className="relative w-44 h-44 mb-6 animate-fadeInScale rounded-full overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.15)] ring-4 ring-[#e7dcc5]">
          <Image
            src="/small_hongdo.png"
            alt="김홍도 캐릭터"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        {/* 타이틀 */}
        <h1 className="text-3xl font-extrabold text-center leading-snug tracking-tight animate-fadeIn">
          김홍도 QR 방탈출
        </h1>
        <p className="mt-2 text-base sm:text-lg text-[#4b3b2a]/80 animate-fadeIn delay-200">
          단원과 함께 떠나는 전통 속 모험
        </p>

        <style jsx global>{`
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.85);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeInScale {
            animation: fadeInScale 1s ease forwards;
          }
          .animate-fadeIn {
            animation: fadeIn 1s ease forwards;
          }
          .delay-200 {
            animation-delay: 0.2s;
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
