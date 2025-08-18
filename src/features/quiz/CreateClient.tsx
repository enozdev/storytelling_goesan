"use client";

import { useRouter } from "next/router";
import { useState, useMemo } from "react";
import { useQuizSession } from "@/store/quizSession";

import type {
  Difficulty,
  SessionQuestion,
  Question,
} from "@/lib/frontend/quiz/types";

export default function CreateClient() {
  const router = useRouter();
  const { sessionId, items, maxCount, addItem } = useQuizSession();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [isLoading, setIsLoading] = useState(false);

  const generated = items.length;
  const progressPct = Math.round((generated / Math.max(maxCount, 1)) * 100);
  const remaining = maxCount - items.length;

  // 주제 추천 목록
  const suggestedChips = useMemo(
    () => [
      "괴산의 역사",
      "괴산의 지형과 산",
      "괴산의 특산물",
      "괴산의 축제",
      "괴산의 문화유산",
      "산막이 옛길의 유래",
    ],
    []
  );

  const canGenerate = topic.trim().length > 0 && !isLoading && remaining > 0;

  const onChip = (chip: string) => setTopic(chip);

  // 문제 생성 핸들러
  const onGenerate = async () => {
    if (!canGenerate) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai-quiz-walk/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error ?? "문제 생성에 실패했습니다.");
        return;
      }

      const data = (await res.json()) as Question; // API는 Question 자체를 반환하므로 그대로 사용
      const qItem: SessionQuestion = {
        question: data,
        isRevealed: false,
        isChosen: false,
      };
      const index = addItem(qItem);
      router.replace(`/ai-quiz-walk/indoor/quiz/${sessionId}/${index}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && canGenerate) onGenerate();
  };

  return (
    <main
      className="min-h-[100dvh] bg-gradient-to-b from-white to-slate-50"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b">
        <div className="mx-auto max-w-4xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-semibold">
              山
            </span>
            <div className="leading-tight">
              <h1 className="text-lg font-bold tracking-tight">
                산막이 옛길 · AI 문제 생성기
              </h1>
              <p className="text-xs text-slate-500">
                주제 작성 → 문제 생성 → 다음 페이지에서 풀이
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-6 pb-[calc(env(safe-area-inset-bottom)_+_1rem)]">
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                AI와 함께하는 퀴즈 산책,
                <br />
                어떤 문제를 만들까요?
              </h2>
              <p className="text-slate-600 mt-1">
                주제를 입력하고, AI가 문제를 생성해드립니다.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {/* 추천 칩 */}
            <div className="flex flex-wrap gap-2 -m-1">
              {suggestedChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => onChip(chip)}
                  className={`m-1 px-3 py-2 rounded-full border text-sm min-h-10 active:scale-[0.98] transition ${
                    topic === chip
                      ? "bg-emerald-600 border-emerald-600 text-white shadow"
                      : "bg-white hover:bg-slate-50"
                  }`}
                  aria-pressed={topic === chip}
                >
                  {topic === chip ? "✓ " : "# "}
                  {chip}
                </button>
              ))}
            </div>

            {/* 입력 */}
            <label className="block text-sm font-medium text-slate-700">
              주제(키워드)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="예: 괴산의 역사, 산막이 옛길의 유래 등"
              className="w-full rounded-xl border px-4 py-3 text-slate-800 shadow-inner outline-none focus:ring-4 focus:ring-emerald-100"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              enterKeyHint="go"
            />

            {/* 난이도 + 남은 수 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">
                  난이도
                </label>
                <div className="flex gap-2">
                  {(
                    [
                      { key: "easy", label: "하" },
                      { key: "medium", label: "중" },
                      { key: "hard", label: "상" },
                    ] as const
                  ).map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setDifficulty(d.key)}
                      className={`flex-1 rounded-xl border px-3 py-3 text-sm min-h-12 ${
                        difficulty === d.key
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white hover:bg-slate-50"
                      }`}
                      aria-pressed={difficulty === d.key}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">
                  생성된 문제 수
                </label>

                <div className="rounded-xl border bg-slate-50 px-3 py-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                    <span>
                      {generated} / {maxCount}
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
              </div>
            </div>

            {/* 생성 버튼 */}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={onGenerate}
                disabled={!canGenerate}
                className={`inline-flex w-full sm:w-auto items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-4 focus:ring-emerald-100 min-h-12 ${
                  canGenerate
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.99]"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
                aria-disabled={!canGenerate}
                aria-label="문제 생성하기"
              >
                <span className="inline-flex items-center gap-2">
                  🧠 문제 생성하기
                </span>
              </button>

              <p className="hidden sm:block text-sm text-slate-500">
                생성 후, 다음 페이지에서 직접 풀고 정답을 확인합니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
