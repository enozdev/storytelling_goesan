"use client";

import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import type { Question } from "@/lib/frontend/quiz/types";

function normalizeOptions(input: any): string[] {
  if (Array.isArray(input)) return input as string[];
  if (typeof input === "string") {
    // 1) JSON 문자열 시도 → 2) 구분자 분리
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

export default function OpenByIdPage() {
  const router = useRouter();
  const rid = useMemo(
    () =>
      Array.isArray(router.query.id) ? router.query.id[0] : router.query.id,
    [router.query.id]
  );

  const [data, setData] = useState<Question | null>(null);
  const [error, setError] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (!router.isReady || !rid) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/ai-quiz-walk/quiz/qr/${encodeURIComponent(String(rid))}`
        );
        const j = await res.json();

        if (!res.ok) {
          setError(j?.error || "문제를 불러올 수 없습니다.");
          setData(null);
          return;
        }

        // 서버가 {question: {...}} 또는 {...} 형태로 줄 수 있어 모두 허용
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

        setData(normalized);
        setError("");
      } catch {
        setError("네트워크 오류");
        setData(null);
      }
    })();
  }, [router.isReady, rid]);

  const canSubmit = !!data && answer.length > 0;
  const userTeamName = localStorage.getItem("userTeamName");
  const count = Number(rid) % 7 != 0 ? Number(rid) % 7 : 7;

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
              {userTeamName} 의 {count}번째 문제!
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
              onClick={() => setSubmitted(true)}
              className={`mt-4 rounded-xl px-4 py-3 font-semibold ${
                !canSubmit
                  ? "bg-slate-200 text-slate-500"
                  : "bg-emerald-600 text-white"
              }`}
            >
              제출하고 정답 확인
            </button>
          ) : (
            <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
              <p className="text-emerald-800">
                정답: <span className="font-semibold">{data.answer}</span>
              </p>
              <p className="text-slate-600 mt-1">
                내 답안: {answer || "(미입력)"}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                  onClick={() => setSubmitted(false)}
                >
                  다시 풀기
                </button>
                <button
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                  onClick={() => router.push("/ai-quiz-walk/indoor")}
                >
                  홈으로
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
