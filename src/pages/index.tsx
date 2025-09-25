// pages/index.tsx
import Head from "next/head";
import { useRouter } from "next/router";
import {
  AcademicCapIcon,
  QrCodeIcon,
  MapPinIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";

type ContentItem = {
  id: string;
  title: string;
  subtitle?: string;
  desc: string;
  href: string;
  icon: React.ComponentType<React.ComponentProps<"svg">>;
  accentFrom: string; // 카드 아이콘 배경(그라디언트) 시작
  accentTo: string; // 카드 아이콘 배경(그라디언트) 끝
  btnBg: string; // 버튼 배경색 클래스
  btnHover: string; // 버튼 호버색 클래스
  btnRing: string; // 버튼 포커스 링 색 클래스
};

const CONTENTS: ContentItem[] = [
  {
    id: "sanmaki-ai-quiz",
    title: "산막이옛길 AI 퀴즈",
    subtitle: "괴산 스토리텔링",
    desc: "AI와 함께 퀴즈를 풀며 산막이옛길을 배우는 체험형 콘텐츠",
    href: "/ai-quiz-walk", // 실제 라우트에 맞게 수정
    icon: AcademicCapIcon,
    accentFrom: "from-emerald-500",
    accentTo: "to-emerald-600",
    btnBg: "bg-emerald-600",
    btnHover: "hover:bg-emerald-700",
    btnRing: "focus-visible:ring-emerald-600",
  },
  {
    id: "hongdo-qr-escape",
    title: "김홍도 QR 방탈출",
    subtitle: "괴산 스토리텔링",
    desc: "QR을 스캔해 미션을 해결하는 인터랙티브 방탈출",
    href: "/escape-room",
    icon: QrCodeIcon,
    accentFrom: "from-amber-500",
    accentTo: "to-amber-600",
    btnBg: "bg-amber-600",
    btnHover: "hover:bg-amber-700",
    btnRing: "focus-visible:ring-amber-600",
  },
];

export default function AllContents() {
  const router = useRouter();
  const handleGo = (href: string) => router.push(href);

  return (
    <div className="min-h-screen bg-white text-[#4f4636]">
      <Head>
        <title>전체 콘텐츠 모음</title>
        <meta name="description" content="괴산 스토리텔링 콘텐츠 선택 페이지" />
        <meta property="og:title" content="전체 콘텐츠 모음" />
      </Head>

      <header className="mx-auto max-w-screen-lg px-4 md:px-6 pt-8 md:pt-12 pb-4">
        <div className="flex items-center gap-2 text-[#6b604e] mb-2">
          <MapPinIcon className="h-5 w-5" />
          <span className="text-sm font-semibold">괴산 스토리텔링</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#3f3629]">
          전체 콘텐츠 모음
        </h1>
        <p className="mt-1 text-[13px] md:text-sm text-[#6b604e]">
          체험할 콘텐츠를 선택하세요.
        </p>
      </header>

      <main className="mx-auto max-w-screen-lg px-4 md:px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {CONTENTS.map((c) => (
            <article
              key={c.id}
              className="rounded-2xl bg-white shadow hover:shadow-md transition border border-[#eadfbe]"
            >
              <div className="p-5 md:p-6">
                <div className="flex items-start gap-3">
                  <div
                    className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${c.accentFrom} ${c.accentTo} text-white`}
                    aria-hidden
                  >
                    <c.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {c.subtitle && (
                      <div className="text-xs font-semibold text-[#7a6f5b]">
                        {c.subtitle}
                      </div>
                    )}
                    <h2 className="mt-0.5 text-lg md:text-xl font-bold text-[#3f3629] truncate">
                      {c.title}
                    </h2>
                    <p className="mt-1 text-sm text-[#6b604e]">{c.desc}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => handleGo(c.href)}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl h-11 w-full
                                text-white font-semibold shadow transition
                                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                                ${c.btnBg} ${c.btnHover} ${c.btnRing}`}
                    aria-label={`${c.title} 시작하기`}
                  >
                    <span>바로 시작</span>
                    <ArrowRightIcon className="h-5 w-5 opacity-90" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
