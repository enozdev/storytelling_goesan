import { useMemo } from "react";
import QuizItems from "@/components/escape-room/quizItems";
import type { SessionQuestion } from "@/lib/frontend/quiz/types";

export default function SavedListPage() {
  const hanji = useMemo(
    () => ({
      bg: "#f8f4ea",
      ink: "#5f513d",
      paper: "#fffdf3",
      chip: "#fff8db",
      border: "#e4d6ad",
      accent: "#b6412e",
      dim: "#efe6ce",
    }),
    []
  );

  const dummyItems: SessionQuestion[] = [
    {
      question: {
        id: "1",
        question: "단원 김홍도의 호(號)는 무엇일까요?",
        options: ["단원", "혜원", "겸재", "청명"],
        answer: "단원",
        difficulty: "easy",
        topic: "김홍도",
      },
    },
    {
      question: {
        id: "2",
        question: "김홍도가 특히 뛰어났던 화풍으로 알려진 것은?",
        options: ["풍속화", "초상화", "불화", "추상화"],
        answer: "풍속화",
        difficulty: "easy",
        topic: "김홍도",
      },
    },
    {
      question: {
        id: "3",
        question:
          "다음 중 김홍도의 ‘씨름’과 같은 계열의 풍속 장면으로 보기 어려운 것은?",
        options: ["서당", "씨름", "무동", "금강전도"],
        answer: "금강전도",
        difficulty: "medium",
        topic: "김홍도",
      },
    },
    {
      question: {
        id: "4",
        question:
          "김홍도의 작품 활동과 가장 밀접한 조선 후기 임금은 누구일까요?",
        options: ["세종", "영조", "정조", "순조"],
        answer: "정조",
        difficulty: "medium",
        topic: "김홍도",
      },
    },
    {
      question: {
        id: "5",
        question: "다음 중 김홍도의 대표적 풍속화 제목은?",
        options: ["서당", "금강전도", "인왕제색도", "송하맹호도"],
        answer: "서당",
        difficulty: "easy",
        topic: "김홍도",
      },
    },
    {
      question: {
        id: "6",
        question: "김홍도의 시대적·화풍적 특징으로 옳은 것은 무엇일까요?",
        options: [
          "18세기 후반 일상의 풍속을 사실적으로 묘사했다",
          "삼국시대 불교미술 양식을 계승했다",
          "고려청자 문양 연구로 유명하다",
          "조선 후기 추상표현주의를 개척했다",
        ],
        answer: "18세기 후반 일상의 풍속을 사실적으로 묘사했다",
        difficulty: "medium",
        topic: "김홍도",
      },
    },
    {
      question: {
        id: "7",
        question:
          "다음 중 김홍도와 동시대 혹은 관련 화가로 묶기 ‘가장’ 어려운 인물은?",
        options: ["신윤복", "정선", "안견", "김득신"],
        answer: "안견",
        difficulty: "medium",
        topic: "김홍도",
      },
    },
  ];

  const Header = (
    <header
      className="sticky top-0 z-10 border-b"
      style={{
        borderColor: hanji.border,
        background: `${hanji.bg}F2`,
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="mx-auto max-w-4xl px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: hanji.dim }}
          ></span>
          <div className="leading-tight">
            <h1 className="text-[18px] md:text-[20px] font-extrabold tracking-tight">
              김홍도 QR 방탈출 · 저장된 문제
            </h1>
            <p className="text-xs" style={{ color: `${hanji.ink}B3` }}>
              내가 만든 문제들을 확인하고 QR로 출력해요
            </p>
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: hanji.bg, color: hanji.ink }}
    >
      {Header}
      <main className="mx-auto max-w-4xl px-5 py-8">
        <QuizItems
          title="단원 김홍도 · 저장된 문제"
          items={dummyItems}
          primaryLabel="저장된 문제 QR 보기"
        />
      </main>
    </div>
  );
}
