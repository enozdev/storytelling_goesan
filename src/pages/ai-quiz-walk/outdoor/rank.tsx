"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import {
  TrophyIcon,
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

type Row = {
  teamId: number;
  teamName: string;
  foundCount: number;
  correctCount: number;
  attemptCount: number;
};
type ApiResp = { items: Row[]; total: number; generatedAt: string };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        opacity="0.25"
      />
      <path d="M22 12a10 10 0 0 1-10 10" fill="currentColor" />
    </svg>
  );
}

export default function LeaderboardStyled() {
  const router = useRouter();

  const { data, error, isLoading, mutate } = useSWR<ApiResp>(
    "/api/ai-quiz-walk/quiz/rank?limit=100",
    fetcher,
    { refreshInterval: 3000, revalidateOnFocus: false }
  );

  // correctCount만 기준으로 정렬(동점은 팀명 오름차순)
  const rows = useMemo(() => {
    const items = data?.items ?? [];
    return [...items].sort((a, b) => {
      if (b.correctCount !== a.correctCount)
        return b.correctCount - a.correctCount;
      return a.teamName.localeCompare(b.teamName, "ko");
    });
  }, [data]);

  return (
    <div className="min-h-screen bg-amber-50 text-stone-800 relative flex flex-col">
      {/* 배경 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(180deg, rgba(245,222,179,0.28), rgba(255,255,255,0.6))",
          backgroundSize: "12px 12px, 100% 100%",
          backgroundPosition: "0 0, 0 0",
        }}
      />

      {/* 헤더 */}
      <header className="relative z-10 px-4 pt-6 pb-2 text-center">
        <div className="mx-auto max-w-2xl flex items-center justify-center gap-2 text-amber-900">
          <TrophyIcon className="w-7 h-7" />
          <h1 className="text-2xl font-black md:text-3xl">보물퀴즈 랭킹</h1>
        </div>
        <p className="text-sm md:text-base text-stone-600 mt-1">
          <span className="font-semibold">정답 수</span>만 기준으로 순위를
          매겨요.
        </p>
      </header>

      {/* 본문 */}
      <main className="relative z-10 w-full flex-1 px-4 pb-6">
        <div className="mx-auto w-full max-w-md">
          {/* 상태 배지 */}
          <div className="flex items-center justify-between text-xs text-stone-600 mb-2">
            <span className="rounded-full bg-white/80 px-3 py-1 ring-1 ring-black/5">
              {error
                ? "데이터를 불러올 수 없습니다."
                : `총 ${data?.total ?? 0}팀 · 갱신: ${
                    data?.generatedAt
                      ? new Date(data.generatedAt).toLocaleTimeString()
                      : "-"
                  }`}
            </span>
            <button
              className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 ring-1 ring-black/5 hover:bg-white"
              onClick={() => mutate()}
            >
              <ArrowPathIcon className="w-4 h-4" />
              새로고침
            </button>
          </div>

          {/* 랭킹 리스트 */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="rounded-2xl bg-white/90 p-4 ring-1 ring-black/5 flex items-center justify-center">
                <Spinner />
                <span className="ml-2 text-sm text-stone-600">
                  불러오는 중…
                </span>
              </div>
            ) : rows.length === 0 ? (
              <div className="rounded-2xl bg-white/90 p-6 ring-1 ring-black/5 text-center text-stone-600">
                집계된 데이터가 없습니다.
              </div>
            ) : (
              rows.map((r, i) => {
                const rank = i + 1;
                const isTop1 = rank === 1;
                const isTop3 = rank <= 3;

                return (
                  <div
                    key={r.teamId}
                    className={[
                      "rounded-2xl overflow-hidden ring-1 ring-black/5 shadow",
                      isTop1
                        ? "bg-gradient-to-br from-amber-700 via-amber-600 to-amber-500 text-amber-50"
                        : "bg-white/90",
                    ].join(" ")}
                  >
                    {/* 상단 바 */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={[
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                            isTop1
                              ? "bg-white/20 text-amber-50"
                              : isTop3
                              ? "bg-amber-100 text-amber-900"
                              : "bg-stone-100 text-stone-700",
                          ].join(" ")}
                          aria-label={`${rank}위`}
                        >
                          {rank}
                        </div>
                        <div className="min-w-0">
                          <div
                            className={[
                              "truncate font-semibold",
                              isTop1 ? "text-amber-50" : "text-stone-900",
                            ].join(" ")}
                          >
                            {r.teamName}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 정답/발견/시도 */}
                    <div
                      className={[
                        "grid grid-cols-3 text-center",
                        isTop1 ? "divide-white/20" : "divide-stone-200",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "px-2 py-3 text-sm",
                          isTop1 ? "bg-white/10" : "bg-white/70",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-center gap-1 font-semibold">
                          <CheckBadgeIcon className="w-4 h-4" />
                          정답
                        </div>
                        <div
                          className={[
                            "mt-1 text-base font-bold",
                            isTop1 ? "text-amber-50" : "text-stone-900",
                          ].join(" ")}
                        >
                          {r.correctCount}
                        </div>
                      </div>

                      <div className="px-2 py-3 text-sm bg-white/60">
                        <div className="flex items-center justify-center gap-1 font-semibold">
                          <MagnifyingGlassIcon className="w-4 h-4" />
                          발견
                        </div>
                        <div className="mt-1 text-base font-bold text-stone-900">
                          {r.foundCount}
                        </div>
                      </div>

                      <div className="px-2 py-3 text-sm bg-white/70">
                        <div className="flex items-center justify-center gap-1 font-semibold">
                          <TrophyIcon className="w-4 h-4" />
                          시도
                        </div>
                        <div className="mt-1 text-base font-bold text-stone-900">
                          {r.attemptCount}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* 하단 액션바 */}
      <nav className="relative z-20">
        <div className="mx-auto max-w-md w-full px-4 pb-4">
          <div className="rounded-3xl border border-amber-100 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-xl p-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                className="h-12 rounded-2xl font-semibold bg-amber-700 text-amber-50 hover:bg-amber-800 active:bg-amber-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 shadow ring-1 ring-black/5"
                onClick={() => router.push("/ai-quiz-walk/outdoor/scan")}
              >
                QR 찾기
              </button>
              <button
                className="h-12 rounded-2xl font-semibold bg-amber-100 text-amber-900 hover:bg-amber-200 active:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                onClick={() => router.push("/ai-quiz-walk/outdoor")}
              >
                뒤로 가기
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
