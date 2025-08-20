// src/pages/ai-quiz-walk/indoor/quiz/saved.tsx
import React from "react";
import useSWR from "swr";
import SummaryList from "@/components/ai-quiz-walk/quizItems";
import type { SessionQuestion } from "@/lib/frontend/quiz/types";

type ApiItem = {
  question: {
    id: string;
    topic: string;
    difficulty: string;
    question?: string; // optional
    answer?: string; // optional
    options: string[];
  };
  userAnswer?: string;
};
type ApiResponse = { items: ApiItem[] };

/** 페이지 내부 인라인 fetcher */
const fetcher = async (url: string): Promise<ApiResponse> => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "저장된 문제 조회 실패");
  }
  return res.json();
};

function normalizeToSessionQuestion(row: ApiItem): SessionQuestion | null {
  if (!row.question.question || !row.question.answer) return null; // 누락 시 제외

  return {
    question: {
      id: row.question.id,
      topic: row.question.topic,
      difficulty: row.question.difficulty as any, // 필요 시 Difficulty로 캐스팅
      question: row.question.question,
      options: row.question.options ?? [],
      answer: row.question.answer ?? "", // 정답이 없으면 빈 문자열
    },
    userAnswer: row.userAnswer ?? undefined,
  };
}

export default function SavedListPage() {
  const key = "/api/questions/saved";
  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(key, fetcher, {
    revalidateOnFocus: true,
    shouldRetryOnError: true,
  });

  if (isLoading) return <div className="p-6">불러오는 중…</div>;
  if (error)
    return (
      <div className="p-6 text-red-600">
        저장된 문제를 불러오지 못했습니다.
        <br />
        <button
          className="mt-3 underline underline-offset-4"
          onClick={() => mutate()}
        >
          다시 시도
        </button>
      </div>
    );

  // ✅ API 응답을 SessionQuestion[]으로 변환
  const normalizedItems: SessionQuestion[] = (data?.items ?? [])
    .map(normalizeToSessionQuestion)
    .filter((x): x is SessionQuestion => x !== null);

  return (
    <SummaryList
      title="저장된 문제 리스트"
      items={normalizedItems} // ← 타입이 맞으니 에러 사라짐
      onReset={undefined}
      createPath="/ai-quiz-walk/indoor/quiz/create"
      primaryPath="/ai-quiz-walk/indoor/quiz/saved"
      primaryLabel="저장된 문제 QR 보기"
    />
  );
}
