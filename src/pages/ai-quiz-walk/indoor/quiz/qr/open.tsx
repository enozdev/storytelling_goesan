// pages/ai-quiz-walk/indoor/quiz/open.tsx
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// URL-safe Base64 decode
const fromB64Url = (input: string) => {
  const pad = input.length % 4 ? "=".repeat(4 - (input.length % 4)) : "";
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const json =
    typeof window === "undefined"
      ? Buffer.from(b64, "base64").toString("utf-8")
      : decodeURIComponent(escape(atob(b64)));
  return JSON.parse(json);
};

type Payload = {
  v?: number;
  topic?: string;
  difficulty?: string;
  q: string;
  options: string[];
  a: string;
};

export default function OpenTempPage() {
  const router = useRouter();
  const d = typeof router.query.d === "string" ? router.query.d : "";
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string>("");

  // 선택/제출 상태
  const [selected, setSelected] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (!d) return;
    try {
      const obj = fromB64Url(d) as Payload;
      if (!obj?.q || !Array.isArray(obj?.options))
        throw new Error("invalid payload");
      setData(obj);
      setError("");
      // 링크가 바뀔 때마다 초기화
      setSelected("");
      setSubmitted(false);
    } catch {
      setError("링크가 손상되었거나 유효하지 않습니다.");
      setData(null);
    }
  }, [d]);

  if (!d) return null;

  const isCorrect = submitted && selected === data?.a;
  const canSubmit = !!selected && !!data;

  const onSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
  };

  const onReset = () => {
    setSelected("");
    setSubmitted(false);
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      {!data ? (
        <div className="rounded-2xl border p-6 bg-white">
          {error || "문제를 로드할 수 없습니다."}
        </div>
      ) : (
        <div className="rounded-2xl border p-6 bg-white">
          <header className="mb-4">
            <h1 className="text-xl font-bold">공개 문제</h1>
            <p className="text-slate-600 text-sm">
              주제: {data.topic} · 난이도: {data.difficulty}
            </p>
          </header>

          <p className="font-medium">{data.q}</p>

          {/* 선택지: 버튼 형태 */}
          <ul className="mt-3 grid gap-2">
            {data.options.map((o, i) => {
              const active = selected === o;
              const alpha = String.fromCharCode(65 + i); // A, B, C, D...
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setSelected(o)}
                    aria-pressed={active}
                    className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition
                      ${
                        active
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                  >
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-semibold mr-2
                        ${
                          active
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                    >
                      {alpha}
                    </span>
                    {o}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* 제출 / 결과 */}
          {!submitted ? (
            <div className="mt-4 flex gap-2">
              <button
                onClick={onSubmit}
                disabled={!canSubmit}
                className={`rounded-xl px-4 py-3 text-sm font-semibold
                  ${
                    canSubmit
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                  }`}
              >
                정답 제출
              </button>
            </div>
          ) : (
            <div
              className={`mt-4 rounded-xl border p-4
              ${
                isCorrect
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-rose-50 border-rose-200"
              }`}
            >
              <p
                className={`font-semibold ${
                  isCorrect ? "text-emerald-800" : "text-rose-800"
                }`}
              >
                {isCorrect ? "정답입니다! 🎉" : "오답입니다."}
              </p>
              {!isCorrect && (
                <p className="text-slate-700 mt-1">
                  정답: <span className="font-semibold">{data.a}</span>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
