// src/pages/ai-quiz-walk/indoor/quiz/list.tsx
import React from "react";
import { useQuizSession } from "@/store/useQuizSession";
import SummaryList from "@/components/ai-quiz-walk/quizItems";

export default function DraftListPage() {
  const { items, maxCount, reset } = useQuizSession();

  return (
    <SummaryList
      title="임시 생성된 문제 리스트"
      items={items}
      denom={maxCount}
      onReset={reset}
      createPath="/ai-quiz-walk/indoor/quiz/create"
      primaryPath="/ai-quiz-walk/indoor/quiz/savedItems"
      primaryLabel="문제 전체 저장하기"
    />
  );
}
