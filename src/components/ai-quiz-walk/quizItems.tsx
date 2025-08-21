"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { SessionQuestion } from "@/lib/frontend/quiz/types";

type Props = {
  title: string;
  items: SessionQuestion[];
  denom?: number;
  onReset?: () => void;
  createPath?: string;
  isSaved?: boolean;
  primaryLabel?: string;
};

export default function QuizItems({
  title,
  items,
  denom,
  onReset,
  createPath = "/ai-quiz-walk/indoor/quiz/create",
  isSaved = false,
  primaryLabel = "문제 전체 저장하기",
}: Props) {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("user_id"));
    }
  }, []);

  const generated = items.length;
  const base = denom ?? (generated || 1);
  const progressPct = Math.round((generated / Math.max(base, 1)) * 100);
  const hasAny = generated > 0;

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="mt-4 rounded-xl border bg-slate-50 px-3 py-3">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
            <span>
              생성 {generated} / {base}
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              role="progressbar"
              aria-label="생성 진행률"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPct}
              className="h-full bg-emerald-600 transition-[width] duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </header>

      <section className="space-y-3">
        {!hasAny ? (
          <div className="rounded-2xl border p-6 bg-white text-slate-700">
            {/* 저장된 문제 없을 시 */}
            아직 생성된 문제가 없습니다.{" "}
            <button
              onClick={() => router.push(createPath)}
              className="underline underline-offset-4"
            >
              새 문제 만들기
            </button>
          </div>
        ) : (
          <ol className="space-y-3">
            {/* 저장된 문제 존재할 시 */}
            {items.map((it, idx) => (
              <li
                key={it.question.id ?? idx}
                className="rounded-2xl border bg-white"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold px-2">
                      #{idx + 1}
                    </span>

                    {/* 주제 파트 */}
                    <span className="text-sm text-slate-600">
                      주제: <b>{it.question.topic}</b>
                    </span>
                    <span className="hidden sm:inline text-xs text-slate-400">
                      · 난이도: {it.question.difficulty}
                    </span>
                  </div>

                  {/* 옵션 파트 */}
                  <p className="font-medium mt-3">{it.question.question}</p>
                  <ol className="list-decimal pl-5 text-sm mt-2 text-slate-700 space-y-0.5">
                    {it.question.options.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ol>

                  {/* 정답 파트 */}
                  <p className="text-sm text-emerald-700 mt-2">
                    정답:{" "}
                    <span className="font-semibold">{it.question.answer}</span>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={
            isSaved
              ? () => {
                  {
                    /* SavedItems일때 저장된 QR로 가기 */
                  }
                  router.push("/ai-quiz-walk/indoor/quiz/qr");
                }
              : async () => {
                  {
                    /* DraftItems(임시저장)일때 저장하기 파트 */
                  }
                  const res = await fetch("/api/ai-quiz-walk/quiz/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, items }),
                  });
                  if (!res.ok) {
                    alert("문제 저장에 실패했습니다.");
                  } else {
                    onReset;
                    router.push("/ai-quiz-walk/indoor/quiz/savedItems");
                  }
                }
          }
          disabled={!hasAny}
          className={`rounded-xl px-4 py-3 text-sm font-semibold min-h-12 ${
            hasAny
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-slate-200 text-slate-500 cursor-not-allowed"
          }`}
          aria-disabled={!hasAny}
        >
          {primaryLabel}
        </button>

        {/* 문제 전체 초기화 버튼 */}
        {onReset && (
          <button
            onClick={onReset}
            className="rounded-xl border px-4 py-3 text-sm min-h-12 hover:bg-slate-50"
          >
            문제 전체 초기화
          </button>
        )}

        {/* 홈 버튼 */}
        <button
          onClick={() => router.push("/ai-quiz-walk/indoor")}
          className="rounded-xl border px-4 py-3 text-sm min-h-12 hover:bg-slate-50"
        >
          홈으로
        </button>
      </div>
    </main>
  );
}
