import React, { useEffect, useState } from "react";
import useSWR from "swr";
import QuizItems from "@/components/ai-quiz-walk/quizItems";
import type { SessionQuestion } from "@/lib/frontend/quiz/types";
import { useQuizSession } from "@/store/useQuizSession";

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
  // SSR 이슈 -> localStorage 접근은 클라이언트에서만
  const [userId, setUserId] = useState<string | null>(null);
  const { reset } = useQuizSession();
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("user_id"));
    }
  }, []);

  // 리스트 요청
  const { data, error, isLoading } = useSWR(
    userId ? ["/api/ai-quiz-walk/quiz/list", { user_id: userId }] : null,
    ([url, payload]) => postFetcher(url as string, payload),
    { revalidateOnFocus: false }
  );

  if (isLoading || userId === null) {
    return <div className="max-w-2xl mx-auto p-4">불러오는 중…</div>;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-red-600">
        최근 문제를 불러올 수 없습니다.
        <br />
        <span className="text-sm text-gray-600">
          {String(error.message ?? error)}
        </span>
      </div>
    );
  }

  console.log(data?.items);

  return (
    <QuizItems
      title="저장된 문제 리스트"
      items={data?.items ?? []} // API가 SessionQuestion[]을 보장
      onReset={reset}
      createPath="/ai-quiz-walk/indoor/quiz/create"
      isSaved={true}
      primaryLabel="저장된 문제 QR 보기"
    />
  );
}
