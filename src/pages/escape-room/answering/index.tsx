// pages/placing/index.tsx
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";
import { MapPinIcon, PencilIcon } from "@heroicons/react/24/solid";
import { type PropsWithChildren, useMemo } from "react";
import { HanjiBackground } from "@/components/escape-room/ui/HanjiBackground";

/** 대표 이미지 카드 **/
function KHDCard({ src = "/placing_hongdo.png" }: { src?: string }) {
  const altText =
    "조선시대 복장의 캐릭터가 교실 의자에 QR 종이를 붙이는 일러스트";

  return (
    <div
      className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-[0_10px_30px_-12px_rgba(0,0,0,.25)] border border-[#e4d6ad] bg-white"
      style={{
        aspectRatio: "1 / 1",
        height: "clamp(240px, 60vh, 480px)",
      }}
    >
      <Image
        src={src}
        alt={altText}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 480px"
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}

export default function PlacingHome() {
  const router = useRouter();

  return (
    <HanjiBackground>
      <Head>
        <title>QR 방탈출</title>
        <meta
          name="description"
          content="QR을 활용한 교실 방탈출: 김홍도 캐릭터 일러스트와 함께 시작해보세요."
        />
        <meta property="og:title" content="김홍도 QR 방탈출 만들기" />
        <meta property="og:image" content="/kimhongdo2.png" />
      </Head>

      {/* 헤더: 타이틀 */}
      <header className="relative z-10 text-center pt-10 pb-4">
        <div className="flex justify-center items-center gap-3 text-[#5f513d]">
          <PencilIcon className="w-8 h-8" />
          <h1 className="text-3xl font-extrabold tracking-tight">QR 방탈출</h1>
        </div>

        <p className="mt-1 text-[13px] md:text-sm text-[#6b604e]">
          <span className="font-semibold">방탈출 시작!</span>
          QR을 스캔해 첫 번째 퀴즈를 풀어보세요.
        </p>
        <div
          className="mx-auto mt-4 w-24 h-[2px] bg-[#5f513d]/50"
          style={{ boxShadow: "0 1px 0 rgba(0,0,0,.06)" }}
        />
      </header>

      {/* 메인: 이미지 한 장 */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-4">
        <KHDCard src="/scan_hongdo.png" />
        <p
          className={[
            "text-[18px] md:text-md font-medium text-[#5f513d] text-center",
            "px-5 py-3 mt-4 mx-auto max-w-sm",
            "rounded-xl border border-[#e4d6ad]",
            "bg-[#fffdf3]/95 shadow-[0_4px_12px_rgba(0,0,0,.08)]",
          ].join(" ")}
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          카메라를 QR에 맞추면 자동으로 인식됩니다. <br />
          준비되면 아래 버튼을 눌러 시작하세요.
        </p>
      </main>

      {/* 하단: 버튼 1개(고정) */}
      <div className="fixed bottom-10 left-0 w-full z-20 px-4 pb-6">
        <div className="mx-auto w-full max-w-2xl rounded-3xl border border-[#e4d6ad] bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-[0_10px_30px_-12px_rgba(0,0,0,.25)] p-3 md:p-4">
          <button
            aria-label="QR 장소 입력하기"
            className="h-14 w-full rounded-2xl text-base md:text-lg font-semibold shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-[#5f513d] text-[#f8f4ea] hover:bg-[#4d4231] active:bg-[#413628] focus-visible:ring-[#5f513d]"
            onClick={() => router.push("/escape-room/answering/scan")}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <MapPinIcon className="w-6 h-6" />
              <span>방탈출 시작하기</span>
            </span>
          </button>
        </div>
      </div>

      {/* 좌하단 고정 로그아웃 / 수업페이지 버튼 */}
      <div className="fixed left-5 bottom-5 z-30 flex gap-2">
        <button
          className="px-2 py-2 rounded-lg text-base font-semibold bg-white text-gray-700 hover:bg-white opacity-80 hover:opacity-100 transition shadow"
          aria-label="로그아웃"
        >
          로그아웃
        </button>
        <button
          className="px-1 py-2 rounded-lg text-base font-semibold bg-white text-gray-700 hover:bg-white opacity-80 hover:opacity-100 transition shadow"
          onClick={() => router.push("/escape-room")}
        >
          수업 페이지로
        </button>
      </div>
    </HanjiBackground>
  );
}
