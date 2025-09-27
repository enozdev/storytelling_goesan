import { useMemo } from "react";
import QuizItems from "@/components/escape-room/quizItems";
import type { SessionQuestion } from "@/lib/frontend/quiz/types";
import { useQuizSession } from "@/store/useQuizSession.escape";
import useSWR from "swr";
import React, { useEffect, useState } from "react";

type ApiResponse = { items: SessionQuestion[] };

const postFetcher = async (
  url: string,
  payload: unknown
): Promise<ApiResponse> => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status} ${msg}`);
  }
  return res.json();
};

export default function SavedListPage() {
  const hanji = useMemo(
    () => ({
      bg: "#f8f4ea",
      ink: "#5f513d",
      paper: "#fffdf3",
      chip: "#fff8db",
      border: "#e4d6ad",
      accent: "#b6412e",
      dim: "#efe6ce",
    }),
    []
  );

  // SSR 이슈 -> localStorage 접근은 클라이언트에서만
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("user_id"));
    }
  }, []);

  // 저장된 리스트 요청
  const { data, error, isLoading } = useSWR(
    userId
      ? ["/api/escape-room/quiz/list", { user_id: userId, contentsId: 2 }]
      : null,
    ([url, payload]) => postFetcher(url as string, payload),
    { revalidateOnFocus: false }
  );

  if (isLoading || userId === null) {
    return <div className="max-w-2xl mx-auto p-4">불러오는 중…</div>;
  }

  const Header = (
    <header
      className="sticky top-0 z-10 border-b"
      style={{
        borderColor: hanji.border,
        background: `${hanji.bg}F2`,
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="mx-auto max-w-4xl px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: hanji.dim }}
          ></span>
          <div className="leading-tight">
            <h1 className="text-[18px] md:text-[20px] font-extrabold tracking-tight">
              김홍도 QR 방탈출 · 저장된 문제
            </h1>
            <p className="text-xs" style={{ color: `${hanji.ink}B3` }}>
              내가 만든 문제들을 확인하고 QR로 출력해요
            </p>
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: hanji.bg, color: hanji.ink }}
    >
      {Header}
      <main className="mx-auto max-w-4xl px-5 py-8">
        <QuizItems
          title="단원 김홍도 · 저장된 문제"
          items={data?.items ?? []}
          primaryLabel="저장된 문제 QR 보기"
        />
      </main>
    </div>
  );
}
