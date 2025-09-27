// src/store/quizSession.escape.ts
"use client";
import { createQuizSessionStore } from "./factories/createQuizSessionStore";

export const useQuizSession = createQuizSessionStore({
  storageKey: "escape-room-quiz-session", // 새 키
  maxCount: 7,
});
