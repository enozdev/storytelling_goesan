// =====================================
// src/lib/frontend/quiz/types.ts (객관식 고정)
// =====================================
export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  question: string; // 문제 텍스트
  options: string[]; // 4지선다 등
  answer: string; // 정답(옵션 텍스트)
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
}

export interface QuizSessionState {
  sessionId: string;
  items: SessionQuestion[]; // 최대 7개
  maxCount: number; // 기본 7
  userId: string | null; // 로그인 시 사용자 ID 저장
}
