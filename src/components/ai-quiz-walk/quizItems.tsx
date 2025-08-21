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
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("user_id"));
    }
  }, []);

  const generated = items.length;
  const base = denom ?? (generated || 1);
  const progressPct = Math.round((generated / Math.max(base, 1)) * 100);
  const hasAny = generated > 0;

  // ✅ 타이틀/버튼/진행바 테마 (정적 문자열로 분기)
  const resolvedTitle =
    title?.trim() ||
    (isSaved ? "저장된 문제 리스트" : "임시 저장된 문제 리스트");
  const titleColor = isSaved ? "text-blue-700" : "text-emerald-700";
  const titleBadgeClass = isSaved
    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
    : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

  const progressBarColor = isSaved ? "bg-blue-600" : "bg-emerald-600";
  const primaryBtnEnabled = isSaved
    ? "bg-blue-600 text-white hover:bg-blue-700"
    : "bg-emerald-600 text-white hover:bg-emerald-700";
  const primaryBtnDisabled = "bg-slate-200 text-slate-500 cursor-not-allowed";

  // 라벨이 없으면 isSaved 기준 기본값
  const resolvedPrimaryLabel =
    primaryLabel ?? (isSaved ? "저장된 문제 QR 보기" : "문제 전체 저장하기");

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <header className="mb-6">
        <h1 className={`text-2xl font-bold ${titleColor}`}>
          {resolvedTitle}
          <span
            className={`ml-2 align-middle text-xs px-2 py-0.5 rounded-full ${titleBadgeClass}`}
          >
            {isSaved ? "Saved" : "Draft"}
          </span>
        </h1>

        {!isSaved && (
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
                className={`h-full transition-[width] duration-500 ${progressBarColor}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </header>

      <div className="mt-6 mb-5 flex flex-wrap gap-2 space-y-2">
        <button
          onClick={
            isSaved
              ? () => router.push("/ai-quiz-walk/indoor/quiz/qr")
              : async () => {
                  if (isSaving) return;
                  setIsSaving(true);
                  try {
                    const res = await fetch("/api/ai-quiz-walk/quiz/save", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId, items }),
                    });
                    if (!res.ok) throw new Error("save failed");
                    await onReset?.();
                    alert("문제를 저장했습니다!");
                    await router.push("/ai-quiz-walk/indoor/quiz/savedItems");
                  } catch {
                    alert("문제 저장에 실패했습니다.");
                  } finally {
                    setIsSaving(false);
                  }
                }
          }
          disabled={!hasAny || isSaving}
          className={`rounded-xl px-4 py-3 text-sm font-semibold min-h-12 ${
            hasAny && !isSaving ? primaryBtnEnabled : primaryBtnDisabled
          }`}
          aria-disabled={!hasAny || isSaving}
        >
          {isSaving ? "저장 중…" : resolvedPrimaryLabel}
        </button>

        {/* 문제 전체 초기화 버튼/홈 버튼은 그대로 */}
        {!isSaved && (
          <button
            onClick={onReset}
            className="rounded-xl border px-4 py-3 text-sm min-h-12 hover:bg-slate-50"
          >
            문제 전체 초기화
          </button>
        )}
        <button
          onClick={() => router.push("/ai-quiz-walk/indoor")}
          className="rounded-xl border px-4 py-3 text-sm min-h-12 hover:bg-slate-50"
        >
          홈으로
        </button>
      </div>

      <section className="space-y-3">
        {" "}
        {!hasAny ? (
          <div className="rounded-2xl border p-6 bg-white text-slate-700">
            {" "}
            {/* 저장된 문제 없을 시 */} 아직 생성된 문제가 없습니다.{" "}
            <button
              onClick={() => router.push(createPath)}
              className="underline underline-offset-4"
            >
              {" "}
              새 문제 만들기{" "}
            </button>{" "}
          </div>
        ) : (
          <ol className="space-y-3">
            {" "}
            {/* 저장된 문제 존재할 시 */}{" "}
            {items.map((it, idx) => (
              <li
                key={it.question.id ?? idx}
                className="rounded-2xl border bg-white"
              >
                {" "}
                <div className="p-4 sm:p-5">
                  {" "}
                  <div className="flex flex-wrap items-center gap-2">
                    {" "}
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold px-2">
                      {" "}
                      #{idx + 1}{" "}
                    </span>{" "}
                    {/* 주제 파트 */}{" "}
                    <span className="text-sm text-slate-600">
                      {" "}
                      주제: <b>{it.question.topic}</b>{" "}
                    </span>{" "}
                    <span className="hidden sm:inline text-xs text-slate-400">
                      {" "}
                      · 난이도: {it.question.difficulty}{" "}
                    </span>{" "}
                  </div>{" "}
                  {/* 옵션 파트 */}{" "}
                  <p className="font-medium mt-3">{it.question.question}</p>{" "}
                  <ol className="list-decimal pl-5 text-sm mt-2 text-slate-700 space-y-0.5">
                    {" "}
                    {it.question.options.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}{" "}
                  </ol>{" "}
                  {/* 정답 파트 */}{" "}
                  {!isSaved && (
                    <p className="text-sm text-emerald-700 mt-2">
                      {" "}
                      정답:{" "}
                      <span className="font-semibold">
                        {" "}
                        {it.question.answer}{" "}
                      </span>{" "}
                    </p>
                  )}{" "}
                </div>{" "}
              </li>
            ))}{" "}
          </ol>
        )}{" "}
      </section>
    </main>
  );
}
