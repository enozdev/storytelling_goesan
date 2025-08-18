"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  children: React.ReactNode;
  duration?: number; // ms, 기본 1500
  title?: string; // 1줄 타이틀
  subtitle?: string; // 보조 문구
  logoSrc?: string; // /public 경로
};

export default function SplashApp({
  children,
  duration = 1500,
  title = "괴산 산막이 옛길 AI퀴즈",
  subtitle = "AI가 나만의 퀴즈를 만들어드려요",
  logoSrc = "/goesan_logo.png",
}: Props) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!showSplash) return <>{children}</>;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-emerald-600 text-white"
      role="dialog"
      aria-label="앱 로딩 중"
    >
      <div className="w-full max-w-xs px-6">
        {/* 로고 */}
        <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/20">
          <Image
            src={logoSrc}
            alt="로고"
            width={80}
            height={80}
            className="h-full w-full object-cover rounded-full"
            priority
          />
        </div>

        {/* 타이틀/서브타이틀 */}
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-white/90">{subtitle}</p>}
        </div>

        {/* 심플 로더 */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="sr-only">로딩 중</span>
          <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.2s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:0s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:0.2s]" />
        </div>
      </div>

      {/* 부드러운 페이드 인 */}
      <style jsx>{`
        :global(body) {
          overflow: hidden;
        }
        .fixed {
          animation: splash-fade 0.4s ease-out both;
        }
        @keyframes splash-fade {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .fixed {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
