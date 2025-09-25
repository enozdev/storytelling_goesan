import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { CameraIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { type PropsWithChildren, type ButtonHTMLAttributes } from "react";

/** 이미지 */
function SquareShowcase() {
  return (
    <div
      className="relative w-full rounded-2xl border border-[#e4d6ad] bg-white overflow-hidden shadow-[0_15px_45px_-20px_rgba(0,0,0,.35)]"
      style={{ aspectRatio: "1 / 1" }}
    >
      <div className="absolute inset-0 p-2 sm:p-3 ">
        <div className="relative h-full w-full rounded-xl overflow-hidden ring-1 ring-black/5 ">
          <Image
            src="/scan_hongdo.png"
            alt="교실 칠판의 QR을 휴대폰으로 스캔하는 김홍도 캐릭터"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 520px"
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>
    </div>
  );
}

function HelperNote({ children }: PropsWithChildren) {
  return (
    <div className="rounded-xl border border-[#e4d6ad] bg-white p-3 md:p-4 text-center text-[13px] md:text-sm text-[#5d5342] shadow w-96 mx-auto">
      {children}
    </div>
  );
}

type StartCtaProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
};
function StartCta({
  label = "방탈출 시작하기",
  className = "",
  ...rest
}: StartCtaProps) {
  return (
    <button
      {...rest}
      className={
        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl " +
        "bg-[#4f4636] text-white font-semibold shadow hover:bg-[#3f3727] transition " +
        className
      }
      aria-label={label}
      style={{ animation: "glowPulse 2.4s ease-in-out infinite" }}
    >
      <CameraIcon className="h-6 w-6" />
      <span>{label}</span>
      <ArrowRightIcon className="h-5 w-5 opacity-90" />
    </button>
  );
}

export default function QREscapeScan() {
  const router = useRouter();
  const handleScan = () => router.push("/escape-room/answering/scan");

  return (
    <div className="min-h-screen bg-[#f7f2e5] text-[#4f4636]">
      <Head>
        <title>QR 방탈출</title>
        <meta name="description" content="QR을 스캔해 방탈출을 시작하세요" />
        <meta property="og:title" content="QR 방탈출" />
        <meta property="og:image" content="/scan_hongdo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* 컨테이너 */}
      <div className="mx-auto max-w-screen-lg px-4 md:px-6 py-6 md:py-10">
        {/* 헤더 */}
        <header className="pb-4 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#3f3629]">
            QR 방탈출
          </h1>
          <p className="mt-1 text-[13px] md:text-sm text-[#6b604e]">
            <span className="font-semibold">방탈출 시작!</span>
            QR을 스캔해 첫 번째 퀴즈를 풀어보세요.
          </p>
        </header>

        <main>
          <div className="items-start">
            <div className="mx-auto w-full max-w-sm">
              <SquareShowcase />
            </div>
          </div>
        </main>

        <div className="sticky space-y-60">
          <HelperNote>
            카메라를 QR에 맞추면 자동으로 인식됩니다. <br />
            준비되면 아래 버튼을 눌러 시작하세요.
          </HelperNote>
          <StartCta onClick={handleScan} />
        </div>

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
      </div>
    </div>
  );
}
