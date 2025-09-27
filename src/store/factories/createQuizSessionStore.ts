// src/store/factories/createQuizSessionStore.ts
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { makeId } from "@/lib/frontend/utils/makeId";
import type {
  QuizSessionState,
  SessionQuestion,
} from "@/lib/frontend/quiz/types";

export interface QuizActions {
  reset: () => void;
  addItem: (q: SessionQuestion) => number;
  setAnswer: (index: number, answer: string) => void;
  setUserId: (id: string | null) => void;
  getUserId: () => string | null;
  setRole: (id: string | null) => void;
  getRole: () => string | null;
  replaceQuestionAt: (
    index: number,
    nextQuestion: SessionQuestion["question"]
  ) => void;
  pop: () => void;
}

type Config = {
  /** localStorage key (세션별로 고유해야 함) */
  storageKey: string;
  /** 세션별 문제 최대 수 (기본 7) */
  maxCount?: number;
};

export type QuizStore = QuizSessionState & QuizActions;

/** 공통 로직을 공유하는 세션 스토어 팩토리 */
export function createQuizSessionStore({ storageKey, maxCount = 7 }: Config) {
  return create<QuizStore>()(
    persist(
      (set, get) => ({
        sessionId: makeId("sess"),
        items: [],
        maxCount,
        userId: null,
        role: "USER",

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

        setRole: (role) => set({ role }),
        getRole: () => get().role,

        replaceQuestionAt: (index, nextQuestion) =>
          set((s) => {
            if (index < 0 || index >= s.items.length) return s;
            const items = s.items.slice();
            items[index] = {
              ...items[index],
              question: nextQuestion,
              userAnswer: "",
            };
            return { ...s, items };
          }),

        pop: () =>
          set((s) => {
            if (s.items.length === 0) return s;
            const items = s.items.slice(0, -1);
            return { ...s, items };
          }),
      }),
      {
        name: storageKey,
        // SSR 안전성 및 명시적 스토리지 지정(선택)
        storage: createJSONStorage(() => localStorage),
      }
    )
  );
}
