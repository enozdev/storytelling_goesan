// =====================================
// src/lib/quiz/types.ts (객관식 고정)
// =====================================
export type Difficulty = "easy" | "medium" | "hard";
export type Format = "객관식"; // 고정

export interface Question {
  id: string;
  q: string; // 문제 텍스트
  options: string[]; // 4지선다 등
  a: string; // 정답(옵션 텍스트)
  format: Format; // 항상 "객관식"
  difficulty: Difficulty;
  topic: string;
}

export interface GenerateRequest {
  topic: string;
  difficulty: Difficulty;
}

export interface GenerateResponse {
  question: Question;
}

export interface SessionQuestion {
  question: Question;
  userAnswer?: string; // 사용자가 선택한 보기 텍스트
  isRevealed: boolean; // 정답 확인 여부
  isChosen: boolean; // 확정 여부
}

export interface QuizSessionState {
  sessionId: string;
  items: SessionQuestion[]; // 최대 7개
  maxCount: number; // 기본 7
  userId: string | null; // 로그인 시 사용자 ID 저장
}

// =====================================
// src/store/quizSession.ts (Zustand)
// ===============================ㄴㅅ======
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
      userId: localStorage.getItem("userId") || null, // 로그인 시 사용자 ID 저장

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
