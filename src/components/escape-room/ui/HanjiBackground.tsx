import { type PropsWithChildren, memo } from "react";
import clsx from "clsx";

type HanjiBackgroundProps = PropsWithChildren<{
  className?: string;
  vignetteOpacity?: number;
  paperOpacity?: number;
}>;

/** 한지 배경 레이아웃 */
function HanjiBackgroundBase({
  children,
  className,
  vignetteOpacity = 0.06,
  paperOpacity = 0.7,
}: HanjiBackgroundProps) {
  return (
    <div
      className={clsx(
        "min-h-screen relative bg-[#f8f4ea] text-[#5f513d]",
        className
      )}
    >
      {/* 종이결/밝은 톤 */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          opacity: paperOpacity,
          background:
            "radial-gradient(60% 60% at 20% 10%, rgba(255,255,255,.85), rgba(255,255,255,.65))",
        }}
      />
      {/* 비네트(윗쪽 음영) */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(100% 120% at 50% 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,.06) 100%)",
          opacity: vignetteOpacity,
        }}
      />
      {/* 내용 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export const HanjiBackground = memo(HanjiBackgroundBase);
