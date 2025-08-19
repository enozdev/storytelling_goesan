// src/store/quizSession.ts (Zustand)

import { QuizSessionState, SessionQuestion } from "@/lib/frontend/quiz/types";
import { makeId } from "@/lib/frontend/utils/makeId";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface QuizActions {
  reset: () => void;
  addItem: (q: SessionQuestion) => number;
  setAnswer: (index: number, answer: string) => void;
  setUserId: (id: string | null) => void; // ✅ 추가
}

export const useQuizSession = create<QuizSessionState & QuizActions>()(
  persist(
    (set, get) => ({
      sessionId: makeId("sess"),
      items: [],
      maxCount: 7,
      userId: null,

      reset: () => set({ sessionId: makeId("sess"), items: [] }),

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

      setUserId: (id) => set({ userId: id }), // ✅ 액션
    }),
    { name: "ai-quiz-walk-indoor-quiz-session" }
  )
);
