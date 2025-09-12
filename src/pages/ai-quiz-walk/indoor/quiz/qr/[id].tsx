"use client";

import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import type { Question } from "@/lib/frontend/quiz/types";
import { fetchAuthed } from "@/lib/frontend/fetchAuthed";

function normalizeOptions(input: any): string[] {
  if (Array.isArray(input)) return input as string[];
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed as string[];
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

  const [data, setData] = useState<Question | null>(null);
  const [author, setAuthor] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (!router.isReady || !rid) return;
    (async () => {
      try {
        // 문제 조회(게스트 허용)
        const { res, json: j } = await fetchAuthed(
          `/api/ai-quiz-walk/quiz/qr/${encodeURIComponent(String(rid))}`
        );
        if (!res.ok) {
          setError(j?.error || "문제를 불러올 수 없습니다.");
          setAuthor("");
          setData(null);
          return;
        }

        const raw = j?.question ?? j;
        const normalized: Question = {
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
        };

        setAuthor(j?.authorTeamName ?? "");
        setData(normalized);
        setError("");

        // ★ 발견 집계: 토큰 없으면 호출하지 않음(관전자/다른 팀용)
        try {
          if (hasAccessToken()) {
            const { res: r2, json: scanJ } = await fetchAuthed(
              "/api/ai-quiz-walk/quiz/qr/scan",
              {
                method: "POST",
                body: JSON.stringify({ qrId: String(rid) }),
              }
            );
            if (r2.ok && Number.isFinite(scanJ?.foundCount)) {
              localStorage.setItem("found_count", String(scanJ.foundCount));
            }
          }
        } catch {
          // ignore (관전 모드에서는 실패해도 무시)
        }
      } catch {
        setError("네트워크 오류");
        setData(null);
      }
    })();
  }, [router.isReady, rid]);

  const canSubmit = !!data && answer.length > 0;
  const count = Number(rid) % 7 !== 0 ? Number(rid) % 7 : 7;

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      {!data ? (
        <div className="rounded-2xl border p-6 bg-white">
          {error || "로딩 중..."}
        </div>
      ) : (
        <div className="rounded-2xl border p-6 bg-white">
          <header className="mb-4">
            <h1 className="text-xl font-bold">
              {author} 의 {count}번째 문제!
            </h1>
            <p className="text-slate-600 text-sm">
              주제: {data.topic} · 난이도: {data.difficulty ?? "—"}
            </p>
          </header>

          <p className="font-medium">{data.question}</p>

          <ul className="space-y-2 mt-3">
            {data.options.map((opt, i) => (
              <li key={i}>
                <label className="inline-flex items-center gap-2">
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
                      "/api/ai-quiz-walk/quiz/attempt",
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
                <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                  <p className="text-emerald-800">
                    정답: <span className="font-semibold">{data.answer}</span>
                  </p>

                  <p className="text-slate-600 mt-1">
                    내 답안: {answer || "(미입력)"}
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4">
                  <p className="text-emerald-800">
                    정답: <span className="font-semibold">{data.answer}</span>
                  </p>

                  <p className="text-red-600 mt-1">
                    내 답안: {answer || "(미입력)"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
