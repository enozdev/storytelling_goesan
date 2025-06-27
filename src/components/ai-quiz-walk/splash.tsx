"use client";

import { useEffect, useState } from "react";

export default function SplashApp1({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000); // 2초
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 flex flex-col items-center justify-center">
        <div className="animate-fade-in-up text-center">
          <div className="mb-4">
            <img
              src="/goesan_logo.png" // public 폴더에 로고나 자연 이미지 위치
              alt="산막이 로고"
              className="w-24 h-24 mx-auto rounded-full shadow-md"
            />
          </div>
          <h1 className="text-3xl md:text-4xl text-neon-green font-bold  text-emr tracking-wide drop-shadow-lg">
            괴산 산막이 옛길 <br />
            AI퀴즈
          </h1>
          <p className="text-white mt-5 text-xl md:text-base font-medium">
            AI가 나만의 퀴즈를 만들어드려요
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
