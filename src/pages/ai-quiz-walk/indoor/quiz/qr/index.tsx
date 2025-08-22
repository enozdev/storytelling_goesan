// pages/ai-quiz-walk/indoor/quiz/qr/index.tsx
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import type { Question } from "@/lib/frontend/quiz/types";
import { useRouter } from "next/router";

export default function QrListPage() {
  const [origin, setOrigin] = useState("");
  const [rows, setRows] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          return;
        }

        const res = await fetch("/api/ai-quiz-walk/quiz/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });

        const j = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.error("QR list load failed:", j?.error || j);
          return;
        }
        console.log(j);

        const normalized = Array.isArray(j.items)
          ? j.items.map((it: any) => {
              const q = it?.question ?? it; // 혹시 래핑 없이 올 때 대비
              const options = Array.isArray(q?.options)
                ? q.options
                : (() => {
                    try {
                      return JSON.parse(q?.options ?? "[]");
                    } catch {
                      return [];
                    }
                  })();

              return {
                id: String(q?.id ?? ""),
                topic: q?.topic ?? "",
                difficulty: q?.difficulty ?? "medium",
                question: q?.question ?? "",
                options,
                answer: q?.answer ?? "",
              };
            })
          : [];

        setRows(normalized);

        console.log("rows= ", normalized);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <main className="p-6">로딩 중…</main>;

  if (!rows.length) return <main className="p-6">저장된 문제가 없습니다.</main>;

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
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
              onClick={() => router.push("/ai-quiz-walk/indoor")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
            >
              홈으로
            </button>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3">
        {rows.map((s, i) => {
          const url = `${origin}/ai-quiz-walk/indoor/quiz/qr/${s.id}`;
          return (
            <article key={s.id} className="rounded-2xl border bg-white p-5">
              <p className="text-xs text-slate-500">#{i + 1}</p>
              <h2 className="text-sm font-semibold leading-5">{s.question}</h2>
              <p className="text-xs text-slate-500 mt-1">
                주제: {s.topic} · 난이도: {s.difficulty}
              </p>

              <div className="mt-3 mx-auto w-[168px] h-[168px] border rounded-xl p-2 bg-white">
                <QRCode
                  value={url}
                  size={150}
                  style={{ width: 150, height: 150 }}
                />
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(url)}
                  className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                >
                  링크 복사
                </button>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                >
                  새 창에서 열기
                </a>
              </div>
            </article>
          );
        })}
      </section>

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
        }
      `}</style>
    </main>
  );
}
