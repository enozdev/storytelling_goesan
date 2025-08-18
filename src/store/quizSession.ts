// =====================================
// src/store/quizSession.ts (Zustand)
// ===============================ㄴㅅ======
import { QuizSessionState, SessionQuestion } from "@/lib/frontend/quiz/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface QuizActions {
  reset: () => void;
  addItem: (q: SessionQuestion) => number; // index 반환
  setAnswer: (index: number, answer: string) => void;
  reveal: (index: number) => void;
  choose: (index: number) => void;
  unchoose: (index: number) => void;
}

export const useQuizSession = create<QuizSessionState & QuizActions>()(
  persist(
    (set, get) => ({
      sessionId: crypto.randomUUID(),
      items: [],
      maxCount: 7,
      userId: localStorage.getItem("user_id") || null, // 로그인 시 사용자 ID 저장

      reset: () => set({ sessionId: crypto.randomUUID(), items: [] }),

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

      reveal: (index) => {
        const items = [...get().items];
        if (!items[index]) return;
        items[index] = { ...items[index], isRevealed: true };
        set({ items });
      },

      choose: (index) => {
        const items = [...get().items];
        if (!items[index]) return;
        items[index] = { ...items[index], isChosen: true };
        set({ items });
      },

      unchoose: (index) => {
        const items = [...get().items];
        if (!items[index]) return;
        items[index] = { ...items[index], isChosen: false };
        set({ items });
      },
    }),
    { name: "ai-quiz-walk-indoor-quiz-session" }
  )
);
