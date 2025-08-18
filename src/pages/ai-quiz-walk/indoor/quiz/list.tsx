"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useQuizSession } from "@/store/quizSession";
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";

type FilterKey = "all" | "chosen" | "unchosen";

export default function SummaryPage() {
  const router = useRouter();
  const { sessionId, items, maxCount, reset, choose, unchoose } =
    useQuizSession();

  // 집계
  const generated = items.length;
  const chosenCount = items.filter((it) => it.isChosen).length;
  const progressPct = Math.round((generated / Math.max(maxCount, 1)) * 100);

  // 필터링
  const [filter, setFilter] = useState<FilterKey>("all");
  const filtered = useMemo(() => {
    if (filter === "chosen") return items.filter((it) => it.isChosen);
    if (filter === "unchosen") return items.filter((it) => !it.isChosen);
    return items;
  }, [items, filter]);

  const hasAny = generated > 0;
  const hasChosen = chosenCount > 0;

  const toggleChoose = (idx: number) => {
    const it = items[idx];
    if (!it) return;
    if (it.isChosen) unchoose(idx);
    else choose(idx);
  };

  const goSolve = (idx: number) => {
    router.push(`/ai-quiz-walk/indoor/quiz/${sessionId}/${idx}`);
  };

  const saveQuestions = async () => {
    if (!hasChosen) return;
    alert(`저장 API를 연결하세요. (확정된 문제: ${chosenCount}개)`);
    // TODO: 확정된 문제만 순회 저장
    // const list = items
    //   .map((it, idx) => ({ it, idx }))
    //   .filter(({ it }) => it.isChosen);
    // for (const { it } of list) { await fetch("/api/user/question/save", {...}) }
  };

  const startNew = () => {
    router.push("/ai-quiz-walk/indoor/quiz/new");
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
      {/* 헤더 + 진행률 */}
      <header className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">생성된 문제 리스트</h1>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mt-4 rounded-xl border bg-slate-50 px-3 py-3">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
            <span>
              생성 {generated} / {maxCount}
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

      {/* 리스트 */}
      <section className="space-y-3">
        {!hasAny ? (
          <div className="rounded-2xl border p-6 bg-white text-slate-700">
            아직 생성된 문제가 없습니다.{" "}
            <button onClick={startNew} className="underline underline-offset-4">
              새 문제 만들기
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border p-6 bg-white text-slate-700">
            선택한 필터에 해당하는 문제가 없습니다.
          </div>
        ) : (
          <ol className="space-y-3">
            {filtered.map((it, visibleIdx) => {
              // 실제 index 계산(원본 items 기준)
              const realIndex = items.indexOf(it);
              const revealed = it.isRevealed;
              const chosen = it.isChosen;

              return (
                <li key={realIndex} className="rounded-2xl border bg-white">
                  <div className="p-4 sm:p-5">
                    {/* 상단 라인: 번호/주제 + 상태 배지 */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold px-2">
                          #{realIndex + 1}
                        </span>
                        <span className="text-sm text-slate-600">
                          주제: <b>{it.question.topic}</b>
                        </span>
                        <span className="hidden sm:inline text-xs text-slate-400">
                          · 난이도: {it.question.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* 문제/선지 */}
                    <p className="font-medium mt-3">{it.question.q}</p>
                    <ul className="list-disc pl-5 text-sm mt-2 text-slate-700 space-y-0.5">
                      {it.question.options.map((o: string, i: number) => (
                        <li key={i}>{o}</li>
                      ))}
                    </ul>

                    {revealed && (
                      <p className="text-sm text-emerald-700 mt-2">
                        정답:{" "}
                        <span className="font-semibold">{it.question.a}</span>{" "}
                        <span className="text-slate-500">
                          (내 답안: {it.userAnswer ?? "—"})
                        </span>
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* 페이지 하단 액션 */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          // onClick={saveQuestions}
          onClick={() => router.push("/ai-quiz-walk/indoor/quiz/qr")}
          disabled={!hasChosen}
          className={`rounded-xl px-4 py-3 text-sm font-semibold min-h-12 ${
            hasChosen
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-slate-200 text-slate-500 cursor-not-allowed"
          }`}
          aria-disabled={!hasChosen}
        >
          문제 전체 저장하기
        </button>

        <button
          onClick={reset}
          className="rounded-xl border px-4 py-3 text-sm min-h-12 hover:bg-slate-50"
        >
          문제 전체 초기화
        </button>

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
