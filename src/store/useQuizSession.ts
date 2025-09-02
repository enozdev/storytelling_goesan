// src/store/quizSession.ts (Zustand)

import { QuizSessionState, SessionQuestion } from "@/lib/frontend/quiz/types";
import { makeId } from "@/lib/frontend/utils/makeId";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface QuizActions {
  reset: () => void;
  addItem: (q: SessionQuestion) => number;
  setAnswer: (index: number, answer: string) => void;
  setUserId: (id: string | null) => void;
  getUserId: () => string | null;
  /** 현재 인덱스의 문제를 교체(길이 유지, 카운트 증가 X) */
  replaceQuestionAt: (
    index: number,
    nextQuestion: SessionQuestion["question"]
  ) => void;
  pop: () => void;
}

export const useQuizSession = create<QuizSessionState & QuizActions>()(
  persist(
    (set, get) => ({
      sessionId: makeId("sess"),
      items: [],
      maxCount: 7,
      userId: null,

      reset: () =>
        set({
          sessionId: makeId("sess"),
          items: [],
        }),

      addItem: (q) => {
        const { items, maxCount } = get();
        if (items.length >= maxCount) return items.length - 1;
        const next = [...items, q];
        set({ items: next });
        return next.length - 1;
      },

      setAnswer: (index, answer) => {
        const items = [...get().items];
        if (!items[index]) return;
        items[index] = { ...items[index], userAnswer: answer };
        set({ items });
      },

      setUserId: (id) => set({ userId: id }),

      getUserId: () => get().userId,

      replaceQuestionAt: (index, nextQuestion) =>
        set((s) => {
          if (index < 0 || index >= s.items.length) return s;
          const items = s.items.slice();

          items[index] = {
            ...items[index],
            question: nextQuestion, // 문제 본문 교체
            userAnswer: "", // 기존 답안 초기화
          };

          return { ...s, items };
        }),

      pop: () =>
        set((s) => {
          if (s.items.length === 0) return s;
          const items = s.items.slice(0, -1); // 마지막 요소 제외
          return { ...s, items };
        }),
    }),
    {
      name: "ai-quiz-walk-indoor-quiz-session",
    }
  )
);
