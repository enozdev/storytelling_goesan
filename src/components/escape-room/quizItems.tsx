"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/router";
import type { SessionQuestion } from "@/lib/frontend/quiz/types";

type Props = {
  title: string;
  items: SessionQuestion[];
  primaryLabel?: string;
};

export default function QuizItems({
  title,
  items,
  primaryLabel = "저장된 문제 QR 보기",
}: Props) {
  const router = useRouter();

  // 한지 톤 팔레트
  const hanji = useMemo(
    () => ({
      bg: "#f8f4ea",
      ink: "#5f513d",
      paper: "#fffdf3",
      chip: "#fff8db",
      border: "#e4d6ad",
      accent: "#b6412e",
      dim: "#efe6ce",
      subtle: "rgba(0,0,0,.06)",
    }),
    []
  );

  const hasAny = items.length > 0;

  // 저장본 전용 타이틀/배지
  const resolvedTitle = title?.trim() || "저장된 문제 리스트";
  const titleColor = "text-[#5f513d]";
  const titleBadgeClass = "bg-[#fff8db] text-[#5f513d] ring-1 ring-[#e4d6ad]";

  return (
    <main
      className="mx-auto max-w-4xl px-5 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]"
      style={{ background: hanji.bg, color: hanji.ink }}
    >
      <header className="mb-6">
        <h1 className={`text-2xl font-extrabold ${titleColor}`}>
          {resolvedTitle}
          <span
            className={`ml-2 align-middle text-xs px-2 py-0.5 rounded-full ${titleBadgeClass}`}
          >
            Saved
          </span>
        </h1>
      </header>

      <div className="mt-6 mb-5 flex flex-wrap gap-2 space-y-2">
        <button
          onClick={() => router.push("/escape-room/questioning/quiz/qr")}
          disabled={!hasAny}
          className={`rounded-xl px-4 py-3 text-sm font-semibold min-h-12 hover:opacity-95 ${
            hasAny ? "" : "cursor-not-allowed"
          }`}
          style={{
            background: hasAny ? hanji.ink : "#efe6ce",
            color: hasAny ? hanji.bg : "#8a7b62",
          }}
          aria-disabled={!hasAny}
        >
          {primaryLabel}
        </button>

        <button
          onClick={() => router.push("/escape-room/questioning")}
          className="rounded-xl px-4 py-3 text-sm min-h-12 hover:opacity-90"
          style={{
            background: "#fff",
            border: `1px solid ${hanji.border}`,
            color: hanji.ink,
          }}
        >
          홈으로
        </button>
      </div>

      <section className="space-y-3">
        {!hasAny ? (
          <div
            className="rounded-2xl p-6"
            style={{ background: "#fff", border: `1px solid ${hanji.border}` }}
          >
            <p>저장된 문제가 없습니다.</p>
          </div>
        ) : (
          <ol className="space-y-3">
            {items.map((it, idx) => (
              <li
                key={it.question.id ?? idx}
                className="rounded-2xl"
                style={{
                  background: "#fff",
                  border: `1px solid ${hanji.border}`,
                }}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* 번호 배지 */}
                    <span
                      className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg text-xs font-semibold px-2"
                      style={{ background: hanji.dim, color: "#6b5b43" }}
                    >
                      #{idx + 1}
                    </span>
                    {/* 주제/난이도 */}
                    <span
                      className="text-sm"
                      style={{ color: `${hanji.ink}CC` }}
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
                    className="font-semibold mt-3"
                    style={{ color: hanji.ink }}
                  >
                    {it.question.question}
                  </p>

                  <ol
                    className="list-decimal pl-5 text-sm mt-2 space-y-0.5"
                    style={{ color: `${hanji.ink}CC` }}
                  >
                    {it.question.options.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ol>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
