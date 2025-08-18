"use client";
// pages/ai-quiz-walk/indoor/quiz/qr-temp.tsx

import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { useRouter } from "next/router";
import { useQuizSession } from "@/store/quizSession";

// URL-safe Base64
const toB64Url = (input: string) =>
  (typeof window === "undefined"
    ? Buffer.from(input, "utf-8").toString("base64")
    : btoa(unescape(encodeURIComponent(input)))
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

export default function QrClient() {
  const router = useRouter();
  const { items } = useQuizSession();

  const chosen = useMemo(() => items.filter((it) => it.isChosen), [items]);

  const [origin, setOrigin] = useState("");
  const [qrSize, setQrSize] = useState<128 | 168 | 192>(168);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fromEnv = process.env.NEXT_PUBLIC_BASE_URL ?? "";
    if (fromEnv) setOrigin(fromEnv.replace(/\/+$/, ""));
    else if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const rows = useMemo(() => {
    if (!origin) return [];
    return chosen.map((it, i) => {
      const payload = {
        v: 1,
        topic: it.question.topic,
        difficulty: it.question.difficulty,
        q: it.question.q,
        options: it.question.options,
        a: it.question.a,
      };
      const d = toB64Url(JSON.stringify(payload));
      const url = `${origin}/ai-quiz-walk/indoor/quiz/qr/open?d=${encodeURIComponent(
        d
      )}`;
      return { idx: i + 1, ...payload, url, dlen: d.length };
    });
  }, [chosen, origin]);

  const onCopy = async (url: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1200);
    } catch {
      alert("복사 실패");
    }
  };

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-emerald-50/40 via-white to-slate-50">
      <div className="mx-auto max-w-5xl px-5 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {/* 헤더 */}
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                QR 목록
              </h1>
            </div>

            {/* 우측 액션 */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => window.print()}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
              >
                전체 인쇄
              </button>
              <button
                onClick={() => router.push("/ai-quiz-walk/indoor/quiz/list")}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
              >
                돌아가기
              </button>
            </div>
          </div>
        </header>

        {/* 본문 */}
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm">
            확정된 문제가 없습니다.{" "}
            <button
              onClick={() => router.push("/ai-quiz-walk/indoor/quiz/list")}
              className="underline underline-offset-4 text-emerald-700 hover:text-emerald-800"
            >
              목록으로
            </button>
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3">
            {rows.map((s) => (
              <article
                key={s.idx}
                className="group rounded-2xl border border-slate-200 bg-white p-5 flex flex-col items-stretch gap-3 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* 상단 메타 */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">#{s.idx}</p>
                    <h2 className="text-sm font-semibold leading-5 text-slate-900 line-clamp-2">
                      {s.q}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      주제: {s.topic} · 난이도: {s.difficulty}
                    </p>
                  </div>
                </div>

                {/* QR */}
                <div className="self-center bg-white p-3 rounded-2xl border border-slate-200 ring-1 ring-emerald-100/60 shadow-inner">
                  <QRCode
                    value={s.url}
                    size={qrSize}
                    style={{ width: qrSize, height: qrSize }}
                    aria-label={`문제 #${s.idx} QR`}
                  />
                </div>

                {/* URL 및 액션 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onCopy(s.url, s.idx)}
                      className={`rounded-lg border px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 ${
                        copiedIndex === s.idx
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      }`}
                      aria-live="polite"
                    >
                      {copiedIndex === s.idx ? "복사됨" : "링크 복사"}
                    </button>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                    >
                      새 창에서 열기
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      {/* 인쇄 스타일 */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }
          header {
            display: none !important;
          }
          article {
            break-inside: avoid;
          }
          body {
          }
        }
      `}</style>
    </main>
  );
}
