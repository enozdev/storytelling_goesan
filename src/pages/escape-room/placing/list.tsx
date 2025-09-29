import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

/** ---------- 타입 ---------- */
type SessionQuestion = {
  question: {
    id?: string | number;
    idx?: number;
    topic: string;
    difficulty: string;
    question: string;
    options: string[];
    answer: string;
    nextLocation?: string | null;
    contentsId?: number | null;
  };
};

type Hanji = {
  bg: string;
  ink: string;
  paper: string;
  chip: string;
  border: string;
  accent: string;
  dim: string;
};

/** ---------- 아이콘 ---------- */
function ArrowDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 4v14m0 0l-5-5m5 5l5-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
    </svg>
  );
}

function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/** ---------- 페이지 ---------- */
export default function QuizFlowPage() {
  // 팔레트
  const hanji = useMemo<Hanji>(
    () => ({
      bg: "#f8f4ea",
      ink: "#5f513d",
      paper: "#fffdf3",
      chip: "#fff8db",
      border: "#e4d6ad",
      accent: "#b6412e",
      dim: "#efe6ce",
    }),
    []
  );

  const router = useRouter();

  const [items, setItems] = useState<SessionQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const CONTENTS_ID = 2;

  // 로드
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const user_id = localStorage.getItem("user_id") ?? undefined;
        const res = await fetch("/api/escape-room/quiz/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id, contentsId: CONTENTS_ID }),
        });
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(t || `HTTP ${res.status}`);
        }
        const data = (await res.json()) as { items: SessionQuestion[] };

        // idx 정규화 + 정렬(오름차순)
        const normalized = (data.items ?? []).map((it, i) => ({
          ...it,
          question: {
            ...it.question,
            idx: typeof it.question.idx === "number" ? it.question.idx : i,
            contentsId: it.question.contentsId ?? CONTENTS_ID,
          },
        }));
        const asc = normalized.sort(
          (a, b) => (a.question.idx ?? 0) - (b.question.idx ?? 0)
        );

        setItems(asc);
      } catch (e: any) {
        setError(e?.message ?? "목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const total = items.length;
  const filled = items.filter(
    (it) => (it.question.nextLocation ?? "").trim().length > 0
  ).length;

  if (loading) {
    return (
      <Scaffold hanji={hanji} title="힌트 흐름도">
        <CenterCard hanji={hanji}>불러오는 중…</CenterCard>
      </Scaffold>
    );
  }

  if (error) {
    return (
      <Scaffold hanji={hanji} title="힌트 흐름도">
        <CenterCard hanji={hanji}>
          <p>목록을 불러오지 못했습니다.</p>
          <p className="text-sm mt-1" style={{ color: `${hanji.ink}B3` }}>
            {error}
          </p>
          <button
            onClick={() => location.reload()}
            className="mt-3 rounded-xl px-4 py-2 font-semibold hover:opacity-90"
            style={{ background: hanji.ink, color: hanji.bg }}
          >
            새로고침
          </button>
        </CenterCard>
      </Scaffold>
    );
  }

  if (total === 0) {
    return (
      <Scaffold hanji={hanji} title="힌트 흐름도">
        <CenterCard hanji={hanji}>표시할 문제가 없습니다.</CenterCard>
      </Scaffold>
    );
  }

  return (
    <Scaffold hanji={hanji} title="힌트 흐름도">
      {/* 상단 요약 */}
      <section className="mx-auto max-w-3xl px-5 pt-6">
        <div
          className="rounded-2xl p-4 border flex items-center gap-3"
          style={{ background: hanji.chip, borderColor: hanji.border }}
        >
          <span className="text-sm" style={{ color: `${hanji.ink}CC` }}>
            총 {total}개 · 작성 완료 {filled}개
          </span>
          <div className="ml-auto flex gap-2">
            <Link
              href="/escape-room/placing/input"
              className="rounded-xl px-3 py-2 text-sm font-semibold hover:opacity-90"
              style={{ background: hanji.ink, color: hanji.bg }}
            >
              힌트 입력으로 이동
            </Link>
          </div>
        </div>
      </section>

      {/* 흐름도 */}
      <main className="mx-auto max-w-3xl px-5 py-6">
        <ol className="relative">
          {items.map((it, i) => {
            const idx = it.question.idx ?? i;
            const next = (it.question.nextLocation ?? "").trim();
            const isLast = i === items.length - 1;

            return (
              <li key={idx} className="mb-6">
                <div
                  className="rounded-2xl p-4 border shadow-sm"
                  style={{ background: "#fff", borderColor: hanji.border }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg text-xs font-semibold px-2"
                      style={{ background: hanji.dim, color: "#6b5b43" }}
                    >
                      #{i + 1}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: `${hanji.ink}B3` }}
                    >
                      주제:{" "}
                      <b style={{ color: hanji.ink }}>{it.question.topic}</b>
                    </span>
                    <span
                      className="hidden sm:inline text-xs"
                      style={{ color: `${hanji.ink}80` }}
                    >
                      · 난이도: {it.question.difficulty}
                    </span>
                  </div>

                  <p
                    className="mt-2 font-semibold"
                    style={{ color: hanji.ink }}
                  >
                    {it.question.question}
                  </p>

                  <div className="mt-3 flex items-start gap-2">
                    <MapPinIcon className="w-5 h-5 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">
                        다음 장소 힌트
                        {!next && (
                          <span
                            className="ml-2 text-xs"
                            style={{ color: "#b6412e" }}
                          >
                            (미입력)
                          </span>
                        )}
                      </div>
                      <div
                        className="mt-1 rounded-xl px-3 py-2"
                        style={{
                          background: next ? "#eaf7ea" : "#fff6f4",
                          border: `1px solid ${next ? "#b7e0b7" : "#ffd8cf"}`,
                          color: next ? "#145a14" : "#b6412e",
                        }}
                      >
                        {next || "다음 장소 힌트가 아직 입력되지 않았습니다."}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 아래 화살표 */}
                {!isLast && (
                  <div className="flex justify-center my-2">
                    <ArrowDownIcon className="w-6 h-6" />
                  </div>
                )}
              </li>
            );
          })}

          {/* 종료 노드 */}
          <li>
            <div
              className="mx-auto w-fit rounded-full px-4 py-2 text-sm font-semibold"
              style={{
                background: hanji.ink,
                color: hanji.bg,
                boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
              }}
            >
              종료
            </div>
          </li>
        </ol>
      </main>

      {/* 하단 고정 액션 */}
      <footer
        className="fixed left-0 right-0 bottom-0 z-30 border-t"
        style={{
          background: "#ffffffF2",
          borderColor: hanji.border,
          backdropFilter: "blur(6px)",
        }}
      >
        <div className="mx-auto max-w-3xl px-5 py-3 flex flex-wrap items-center gap-2">
          <Link
            href="/escape-room/placing/input"
            className="rounded-xl px-4 py-3 font-semibold hover:opacity-90"
            style={{ background: hanji.ink, color: hanji.bg }}
          >
            힌트 입력으로 돌아가기
          </Link>
          <button
            onClick={() => router.push("/escape-room/placing")}
            className="ml-auto rounded-xl px-4 py-3 text-sm hover:opacity-90"
            style={{
              background: "#fff",
              border: `1px solid ${hanji.border}`,
              color: hanji.ink,
            }}
          >
            뒤로 가기
          </button>
        </div>
      </footer>

      {/* 간단 프린트 최적화 */}
      <style jsx global>{`
        @media print {
          footer {
            display: none;
          }
          header {
            position: static !important;
          }
          a {
            text-decoration: none;
            color: inherit;
          }
          .shadow-sm {
            box-shadow: none !important;
          }
        }
      `}</style>
    </Scaffold>
  );
}

/** ---------- 레이아웃 컴포넌트 ---------- */
function Scaffold({
  hanji,
  title,
  children,
}: {
  hanji: Hanji;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{ background: hanji.bg, color: hanji.ink }}
    >
      <Header hanji={hanji} title={title} />
      {children}
    </div>
  );
}

function Header({ hanji, title }: { hanji: Hanji; title: string }) {
  return (
    <header
      className="sticky top-0 z-10 border-b"
      style={{
        borderColor: hanji.border,
        background: `${hanji.bg}F2`,
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="mx-auto max-w-3xl px-5 py-3">
        <h1 className="text-[18px] md:text-[20px] font-extrabold tracking-tight">
          김홍도 QR 방탈출 · {title}
        </h1>
        <p className="text-xs mt-0.5" style={{ color: `${hanji.ink}B3` }}>
          작성한 ‘다음 장소 힌트’ 순서대로 흐름을 확인하세요.
        </p>
      </div>
    </header>
  );
}

function CenterCard({
  hanji,
  children,
}: {
  hanji: Hanji;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-5">
      <div
        className="rounded-2xl border px-6 py-5 shadow-sm text-center"
        style={{ background: "#fff", borderColor: hanji.border }}
      >
        {children}
      </div>
    </div>
  );
}
