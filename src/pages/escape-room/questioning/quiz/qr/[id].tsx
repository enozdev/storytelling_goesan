"use client";

import { useRouter } from "next/router";
import { useEffect, useState, useMemo, useRef } from "react";
import type { Question } from "@/lib/frontend/quiz/types";
import { fetchAuthed } from "@/lib/frontend/fetchAuthed";

/** ---------- 뷰 모델 ---------- */
type ViewQuestion = Question & {
  nextLocation?: string | null;
};

function normalizeOptions(input: unknown): string[] {
  if (Array.isArray(input)) return input.map(String);
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {}
    return input
      .split(/[,|·]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

// 로그인 여부(토큰 보유)만 체크: 없으면 서버 집계 호출 스킵
const hasAccessToken = () =>
  typeof window !== "undefined" &&
  !!(
    localStorage.getItem("accessToken") || localStorage.getItem("access_token")
  );

export default function OpenByIdPage() {
  const router = useRouter();
  const rid = useMemo(
    () =>
      Array.isArray(router.query.id) ? router.query.id[0] : router.query.id,
    [router.query.id]
  );

  const [data, setData] = useState<ViewQuestion | null>(null);
  const [author, setAuthor] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  // 힌트 모달/타자기 상태
  const [showHint, setShowHint] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [fullHint, setFullHint] = useState<string>("");
  const [typedHint, setTypedHint] = useState<string>("");
  const typerRef = useRef<number | null>(null);

  // 타자기 시작
  const startTypewriter = (text: string) => {
    setTypedHint("");
    if (typerRef.current) window.clearInterval(typerRef.current);
    let i = 0;
    typerRef.current = window.setInterval(() => {
      i += 1;
      setTypedHint(text.slice(0, i));
      if (i >= text.length && typerRef.current) {
        window.clearInterval(typerRef.current);
        typerRef.current = null;
      }
    }, 28); // 타자 속도(조절 가능)
  };

  // 정리
  useEffect(() => {
    return () => {
      if (typerRef.current) window.clearInterval(typerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!router.isReady || !rid) return;
    (async () => {
      try {
        // 문제 조회(게스트 허용)
        const { res, json: j } = await fetchAuthed(
          `/api/escape-room/quiz/qr/${encodeURIComponent(String(rid))}`
        );
        if (!res.ok) {
          setError(j?.error || "문제를 불러올 수 없습니다.");
          setAuthor("");
          setData(null);
          return;
        }

        const raw = j?.question ?? j;
        const normalized: ViewQuestion = {
          id: raw?.id,
          topic: raw?.topic ?? "",
          difficulty: raw?.difficulty ?? "medium",
          question:
            typeof raw?.q === "string"
              ? raw.q
              : typeof raw?.question === "string"
              ? raw.question
              : "",
          options: normalizeOptions(raw?.options),
          answer:
            typeof raw?.a === "string"
              ? raw.a
              : typeof raw?.answer === "string"
              ? raw.answer
              : "",
          // ★ 다음 위치 힌트가 API에 함께 온다면 사용
          nextLocation:
            typeof raw?.nextLocation === "string"
              ? raw.nextLocation
              : raw?.nextLocation == null
              ? null
              : raw.nextLocation,
        };

        setAuthor(j?.authorTeamName ?? "");
        setData(normalized);
        setError("");

        // ★ 발견 집계: 토큰 없으면 호출하지 않음(관전자/다른 팀용)
        // ★ 발견 집계(스캔): 토큰 없으면 호출 X
        try {
          if (hasAccessToken()) {
            const { res: r2, json: scanJ } = await fetchAuthed(
              "/api/escape-room/quiz/qr/scan",
              {
                method: "POST",
                body: JSON.stringify({ qrId: String(rid) }),
              }
            );
            if (r2.ok) {
              if (Number.isFinite(scanJ?.foundCount)) {
                localStorage.setItem("found_count", String(scanJ.foundCount));
              }
              const hint = scanJ?.nextLocation;
              if (
                hint &&
                hint.toLowerCase() !== "null" &&
                hint.toLowerCase() !== "undefined"
              ) {
                localStorage.setItem(`next_hint_${rid}`, hint);
              }
            }
          }
        } catch {
          // ignore
        }
      } catch {
        setError("네트워크 오류");
        setData(null);
      }
    })();
  }, [router.isReady, rid]);

  const canSubmit = !!data && answer.length > 0;
  const count = Number(rid) % 7 !== 0 ? Number(rid) % 7 : 7;

  const openHint = async () => {
    if (!data) return;
    setHintLoading(true);
    setShowHint(true);

    // 0) 로컬 캐시 우선
    let hint = (localStorage.getItem(`next_hint_${rid}`) ?? "").trim();

    // 1) data.nextLocation
    if (!hint) {
      hint = (data.nextLocation ?? "").trim();
    }

    const finalHint =
      hint &&
      hint.toLowerCase() !== "null" &&
      hint.toLowerCase() !== "undefined"
        ? hint
        : "관리자에게 문의하세요. (다음 위치 힌트가 아직 등록되지 않았습니다.)";

    setFullHint(finalHint);
    setHintLoading(false);
    startTypewriter(finalHint);
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      {!data ? (
        <div className="rounded-2xl border p-6 bg-white">
          {error || "로딩 중..."}
        </div>
      ) : (
        <div className="rounded-2xl border p-6 bg-white relative overflow-hidden">
          <header className="mb-4">
            <h1 className="text-xl font-bold">
              {author} 의 {count}번째 문제!
            </h1>
            <p className="text-slate-600 text-sm">
              주제: {data.topic} · 난이도: {data.difficulty ?? "—"}
            </p>
          </header>

          <p className="text-lg leading-relaxed">{data.question}</p>

          <ul className="space-y-2 mt-3">
            {data.options.map((opt, i) => (
              <li key={i}>
                <label className="inline-flex items-center gap-2 text-lg">
                  <input
                    type="radio"
                    name="mc"
                    value={opt}
                    checked={answer === opt}
                    onChange={(e) => {
                      setAnswer(e.target.value);
                      if (submitted) setSubmitted(false);
                    }}
                  />
                  <span>{opt}</span>
                </label>
              </li>
            ))}
          </ul>

          {!submitted ? (
            <button
              disabled={!canSubmit}
              onClick={async () => {
                setSubmitted(true);
                // ★ 정답 집계: 토큰 없으면 서버 호출 스킵(관전자/다른 팀용)
                try {
                  if (hasAccessToken()) {
                    const { res, json: j } = await fetchAuthed(
                      "/api/escape-room/quiz/attempt",
                      {
                        method: "POST",
                        body: JSON.stringify({
                          questionId: data!.id,
                          selected: answer,
                        }),
                      }
                    );
                    if (res.ok && Number.isFinite(j?.correctCount)) {
                      localStorage.setItem(
                        "correct_count",
                        String(j.correctCount)
                      );
                    }
                  }
                } catch {
                  // ignore
                }
              }}
              className={`mt-4 rounded-xl px-4 py-3 font-semibold ${
                !canSubmit
                  ? "bg-slate-200 text-slate-500"
                  : "bg-emerald-600 text-white"
              }`}
            >
              제출하고 정답 확인
            </button>
          ) : (
            <div>
              {answer === data.answer ? (
                <div>
                  <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                    <p className="text-emerald-800">
                      정답: <span className="font-semibold">{data.answer}</span>
                    </p>
                    <p className="text-slate-600 mt-1">
                      내 답안: {answer || "(미입력)"}
                    </p>
                  </div>

                  {/* 다음 위치 힌트 보기 버튼(원래 크기 유지) */}
                  <div>
                    <button
                      onClick={openHint}
                      className="group relative mt-3 w-full rounded-xl px-5 py-3 font-bold text-lg text-[#5f513d] bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 shadow-md hover:shadow-lg transition hover:from-yellow-300 hover:to-yellow-500 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      다음 위치 힌트 보기
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4">
                  <p className="text-red-600">다시 도전해보세요 !</p>
                </div>
              )}
            </div>
          )}

          {/* ───────── Dramatic Hint Modal ───────── */}
          {showHint && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-5"
              role="dialog"
              aria-modal="true"
            >
              {/* Dim */}
              <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.85) 100%)",
                }}
                onClick={() => setShowHint(false)}
              />

              {/* Scroll/Parchment card */}
              <div
                className="relative w-full max-w-lg rounded-3xl border shadow-2xl animate-scaleIn"
                style={{
                  borderColor: "#e4d6ad",
                  background:
                    "linear-gradient(135deg, #fffdf3 0%, #fff7dd 100%)",
                }}
              >
                {/* 상단 장식 */}
                <div className="absolute -top-3 left-6 h-6 w-6 rounded-full bg-[#e4d6ad] shadow" />
                <div className="absolute -top-3 right-6 h-6 w-6 rounded-full bg-[#e4d6ad] shadow" />

                <div className="p-6 md:p-7">
                  <div className="text-center mb-2">
                    <p className="text-xs tracking-widest text-amber-900/60">
                      NEXT LOCATION
                    </p>
                    <h2 className="text-xl md:text-2xl font-extrabold text-[#5f513d] drop-shadow-sm">
                      다음 위치 힌트
                    </h2>
                  </div>

                  <div
                    className="mt-3 rounded-2xl border p-5 bg-[#fffaf0] relative overflow-hidden"
                    style={{ borderColor: "#e4d6ad" }}
                  >
                    {/* 종이 텍스처 느낌 */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-30"
                      style={{
                        background:
                          "repeating-linear-gradient(0deg, transparent, transparent 12px, rgba(0,0,0,0.02) 12px, rgba(0,0,0,0.02) 13px)",
                      }}
                    />
                    {/* 가장자리 그라데이션 */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-2xl"
                      style={{
                        boxShadow:
                          "inset 0 0 60px rgba(0,0,0,0.06), inset 0 0 12px rgba(0,0,0,0.06)",
                      }}
                    />

                    <p
                      className={`relative z-10 text-lg md:text-xl font-semibold leading-relaxed text-[#5f513d] ${
                        hintLoading ? "animate-pulse" : "animate-glowSoft"
                      }`}
                    >
                      {hintLoading ? "힌트를 불러오는 중..." : typedHint}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <button
                      onClick={() => {
                        // 다시 타이핑
                        if (fullHint) startTypewriter(fullHint);
                      }}
                      className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-white"
                      style={{ borderColor: "#e4d6ad", color: "#5f513d" }}
                    >
                      다시 보기
                    </button>

                    <button
                      onClick={() => setShowHint(false)}
                      className="rounded-xl px-4 py-2 text-sm font-semibold bg-[#5f513d] text-[#f8f4ea] hover:opacity-95"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ─────────────────────────────────────── */}
        </div>
      )}
      {/* 페이지 전용 애니메이션 */}
      <style jsx global>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0.92);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scaleIn {
          animation: scaleIn 220ms ease-out;
        }

        @keyframes glowSoft {
          0%,
          100% {
            text-shadow: 0 0 0 rgba(182, 65, 46, 0);
          }
          50% {
            text-shadow: 0 0 10px rgba(182, 65, 46, 0.25);
          }
        }
        .animate-glowSoft {
          animation: glowSoft 1800ms ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
