// src/pages/escape-room/placing/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/** ---------- 타입 ---------- */
type SessionQuestion = {
  question: {
    id?: string;
    idx?: number; // 화면용 고유 키
    topic: string;
    difficulty: string;
    question: string;
    options: string[];
    answer: string;
    nextLocation?: string | null;
  };
};
type Hanji = {
  bg: string;
  ink: string;
  paper: string;
  chip: string;
  border: string;
  accent: string;
  dim: string;
};

/** ---------- 아이콘/도장 ---------- */
function ScrollIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6 6.5c0-1.1.9-2 2-2h8.5A1.5 1.5 0 0 1 18 6v11.5c0 .83-.67 1.5-1.5 1.5H8c-1.1 0-2-.9-2-2V6.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M6 9h12M9 12h7M9 15h7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M5 7.2c-.9 0-1.7.7-1.7 1.6v8.1c0 1.7 1.4 3.1 3.2 3.1h9.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity=".6"
      />
    </svg>
  );
}

/** ---------- 더미 데이터 & 로컬키 ---------- */
const LS_ITEMS = "placing:items";
const LS_PLACED = "placing:placed";
const LS_INDEX = "placing:currentIndex";

const DUMMY_ITEMS: SessionQuestion[] = [
  {
    question: {
      idx: 1,
      topic: "김홍도 인물",
      difficulty: "easy",
      question: "단원 김홍도의 대표적인 직업은 무엇일까요?",
      options: ["화가", "음악가", "시인", "무술가"],
      answer: "화가",
      nextLocation: "",
    },
  },
  {
    question: {
      idx: 2,
      topic: "풍속화",
      difficulty: "easy",
      question: "다음 중 김홍도의 풍속화 주제로 알맞은 것은?",
      options: ["서당 풍경", "우주 탐사", "현대 거리", "해적선"],
      answer: "서당 풍경",
      nextLocation: "",
    },
  },
  {
    question: {
      idx: 3,
      topic: "기법",
      difficulty: "medium",
      question: "김홍도의 그림에서 자주 보이는 표현은?",
      options: [
        "일상 장면의 생동감",
        "금속 질감 표현",
        "추상 기하",
        "현대 팝아트",
      ],
      answer: "일상 장면의 생동감",
      nextLocation: "",
    },
  },
  {
    question: {
      idx: 4,
      topic: "작품 감상",
      difficulty: "medium",
      question: "아이들이 놀이하는 모습을 그린 풍속화를 뭐라고 할까요?",
      options: ["놀이도", "우주도", "금속도", "바코드"],
      answer: "놀이도",
      nextLocation: "",
    },
  },
  {
    question: {
      idx: 5,
      topic: "시대 배경",
      difficulty: "medium",
      question: "김홍도가 활동한 시대로 알맞은 것은?",
      options: ["조선 후기", "고구려", "근대 일제강점기", "대한민국 2000년대"],
      answer: "조선 후기",
      nextLocation: "",
    },
  },
  {
    question: {
      idx: 6,
      topic: "그림 소재",
      difficulty: "easy",
      question: "다음 중 김홍도의 그림 소재로 어울리는 것은?",
      options: ["시장 풍경", "로봇 공장", "우주선 내부", "게임 속 마법"],
      answer: "시장 풍경",
      nextLocation: "",
    },
  },
  {
    question: {
      idx: 7,
      topic: "별칭",
      difficulty: "easy",
      question: "‘단원’은 무엇일까요?",
      options: ["김홍도의 호(별칭)", "그림 도구", "한지 종류", "먹의 이름"],
      answer: "김홍도의 호(별칭)",
      nextLocation: "",
    },
  },
];

/** ---------- 유틸 ---------- */
function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** ---------- 페이지 ---------- */
export default function PlacingIndexPage() {
  // 팔레트
  const hanji = useMemo<Hanji>(
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

  // 상태: 아이템, 현재 인덱스, 부착체크
  const [items, setItems] = useState<SessionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [placedMap, setPlacedMap] = useState<Record<number, boolean>>({});
  const total = items.length;

  // 폼 제어값(현재 문제의 nextLocation / placed)
  const current = total > 0 ? items[currentIndex] : null;
  const curKey = current?.question.idx ?? currentIndex;
  const [draftNextLoc, setDraftNextLoc] = useState<string>("");

  useEffect(() => {
    // 복원
    const savedItems = safeParse<SessionQuestion[]>(
      localStorage.getItem(LS_ITEMS)
    );
    const savedPlaced = safeParse<Record<number, boolean>>(
      localStorage.getItem(LS_PLACED)
    );
    const savedIndex = safeParse<number>(localStorage.getItem(LS_INDEX));

    const initItems = savedItems?.length ? savedItems : DUMMY_ITEMS;
    setItems(initItems);
    setPlacedMap(savedPlaced ?? {});
    setCurrentIndex(
      typeof savedIndex === "number" &&
        savedIndex >= 0 &&
        savedIndex < (initItems?.length ?? 0)
        ? savedIndex
        : 0
    );
  }, []);

  // 현재 문제 변경 시, 입력창 초기화
  useEffect(() => {
    if (!current) return;
    setDraftNextLoc(current.question.nextLocation ?? "");
  }, [currentIndex, total]); // total 포함해 초기 로드에도 적용

  // 로컬스토리지 동기화
  useEffect(() => {
    localStorage.setItem(LS_ITEMS, JSON.stringify(items));
  }, [items]);
  useEffect(() => {
    localStorage.setItem(LS_PLACED, JSON.stringify(placedMap));
  }, [placedMap]);
  useEffect(() => {
    localStorage.setItem(LS_INDEX, JSON.stringify(currentIndex));
  }, [currentIndex]);

  const progressPct = total
    ? Math.round(((currentIndex + 1) / total) * 100)
    : 0;

  const handleSave = () => {
    if (!current) return;
    const idxKey = current.question.idx ?? currentIndex;
    // nextLocation 반영
    setItems((prev) =>
      prev.map((it, i) =>
        (it.question.idx ?? i) === idxKey
          ? {
              ...it,
              question: {
                ...it.question,
                nextLocation: (draftNextLoc ?? "").trim(),
              },
            }
          : it
      )
    );
    setPlacedMap((m) => ({ ...m, [idxKey]: true }));
  };

  const handleNext = () => {
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
  };
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  // 빈 상태
  if (total === 0) {
    return (
      <div
        className="min-h-screen"
        style={{ background: hanji.bg, color: hanji.ink }}
      >
        <Header hanji={hanji} />
        <main className="mx-auto max-w-3xl px-5 py-10">
          <div
            className="rounded-2xl p-8 text-center border"
            style={{ background: "#fff", borderColor: hanji.border }}
          >
            <p className="text-lg font-semibold">부착할 문제가 없습니다.</p>
            <p className="mt-1 text-sm" style={{ color: `${hanji.ink}B3` }}>
              더미 데이터를 불러오거나 문제를 만들어 주세요.
            </p>
            <div className="mt-4 flex gap-2 justify-center">
              <button
                onClick={() => setItems(DUMMY_ITEMS)}
                className="rounded-xl px-4 py-3 font-semibold hover:opacity-90"
                style={{ background: hanji.ink, color: hanji.bg }}
              >
                더미 데이터 불러오기
              </button>
              <Link
                href="/escape-room/questioning/quiz/create"
                className="rounded-xl px-4 py-3 font-semibold hover:opacity-90"
                style={{
                  background: "#fff",
                  border: `1px solid ${hanji.border}`,
                  color: hanji.ink,
                }}
              >
                문제 만들기
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: hanji.bg, color: hanji.ink }}
    >
      <Header hanji={hanji} />

      {/* 상단 진행 상태 (현재/총) */}
      <section className="mx-auto max-w-3xl px-5 pt-6">
        <div
          className="rounded-2xl p-4 border"
          style={{ background: hanji.chip, borderColor: hanji.border }}
        >
          <div
            className="flex items-center justify-between text-sm"
            style={{ color: `${hanji.ink}B3` }}
          >
            <span>
              문제 {currentIndex + 1} / {total}
            </span>
            <span>{progressPct}%</span>
          </div>
          <div
            className="mt-2 h-2 w-full rounded-full overflow-hidden"
            style={{ background: hanji.dim }}
          >
            <div
              className="h-full transition-[width] duration-500"
              style={{ width: `${progressPct}%`, background: hanji.ink }}
            />
          </div>
        </div>
      </section>

      {/* 현재 문제 카드 */}
      <main className="mx-auto max-w-3xl px-5 py-6">
        <article
          className="rounded-2xl p-5 border shadow-sm"
          style={{ background: "#fff", borderColor: hanji.border }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg text-xs font-semibold px-2"
              style={{ background: hanji.dim, color: "#6b5b43" }}
            >
              #{currentIndex + 1}
            </span>
            <span className="text-sm" style={{ color: `${hanji.ink}CC` }}>
              주제:{" "}
              <b style={{ color: hanji.ink }}>{current?.question.topic}</b>
            </span>
            <span
              className="hidden sm:inline text-xs"
              style={{ color: `${hanji.ink}80` }}
            >
              · 난이도: {current?.question.difficulty}
            </span>
            {placedMap[curKey] ? (
              <span
                className="ml-auto text-xs rounded-md px-2 py-1"
                style={{
                  background: "#eaf7ea",
                  color: "#145a14",
                  border: "1px solid #b7e0b7",
                }}
              >
                붙임 완료
              </span>
            ) : null}
          </div>

          <p className="font-semibold mt-3" style={{ color: hanji.ink }}>
            {current?.question.question}
          </p>

          {/* 다음 위치 입력 */}
          <div className="mt-4 grid gap-2">
            <label className="text-sm" style={{ color: `${hanji.ink}B3` }}>
              다음 위치
            </label>
            <div className="flex gap-2 flex-col sm:flex-row">
              <input
                type="text"
                value={draftNextLoc}
                onChange={(e) => setDraftNextLoc(e.target.value)}
                placeholder="예) 교탁 아래, 칠판 오른쪽 구석, 23번 사물함 등"
                maxLength={60}
                className="w-full rounded-xl px-4 py-3 outline-none"
                style={{
                  background: hanji.paper,
                  border: `1px solid ${hanji.border}`,
                  color: hanji.ink,
                }}
              />
              <button
                type="button"
                onClick={handleSave}
                className="shrink-0 rounded-xl px-4 py-3 font-semibold hover:opacity-90"
                style={{ background: hanji.ink, color: hanji.bg }}
              >
                저장
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              id={`placed-${curKey}`}
              type="checkbox"
              className="h-4 w-4"
              checked={!!placedMap[curKey]}
              onChange={(e) =>
                setPlacedMap((m) => ({
                  ...m,
                  [curKey]: e.currentTarget.checked,
                }))
              }
            />
            <label
              htmlFor={`placed-${curKey}`}
              className="text-sm"
              style={{ color: `${hanji.ink}B3` }}
            >
              이 QR을 실제 위치에 붙였어요!
            </label>
          </div>

          {/* 내비게이션 */}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="rounded-xl px-4 py-3 text-sm min-h-12 hover:opacity-90 disabled:opacity-50"
              style={{
                background: "#fff",
                border: `1px solid ${hanji.border}`,
                color: hanji.ink,
              }}
            >
              ← 이전 문제
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= total - 1}
              className="rounded-xl px-4 py-3 text-sm min-h-12 hover:opacity-90 disabled:opacity-50"
              style={{ background: hanji.ink, color: hanji.bg }}
            >
              다음 문제 →
            </button>

            {/* <Link
              href={`/escape-room/placing/qr?idx=${curKey}`}
              className="ml-auto rounded-xl px-4 py-3 text-sm font-semibold hover:opacity-90"
              style={{
                background: "#fff",
                border: `1px solid ${hanji.border}`,
                color: hanji.ink,
              }}
            >
              이 문제 QR 보기
            </Link> */}
          </div>
        </article>
      </main>

      {/* 하단 고정 액션 */}
      <footer
        className="fixed left-0 right-0 bottom-0 z-30 border-t"
        style={{
          background: "#ffffffF2",
          borderColor: hanji.border,
          backdropFilter: "blur(6px)",
        }}
      >
        <div className="mx-auto max-w-3xl px-5 py-3 flex flex-wrap items-center gap-2">
          <Link
            href="/escape-room/questioning/quiz/items"
            className="rounded-xl px-4 py-3 font-semibold hover:opacity-90"
            style={{ background: hanji.ink, color: hanji.bg }}
          >
            QR 코드 모아보기
          </Link>
          <Link
            href="/escape-room/placing"
            className="ml-auto rounded-xl px-4 py-3 text-sm hover:opacity-90"
            style={{
              background: "#fff",
              border: `1px solid ${hanji.border}`,
              color: hanji.ink,
            }}
          >
            뒤로 가기
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Header({ hanji }: { hanji: Hanji }) {
  return (
    <header
      className="sticky top-0 z-10 border-b"
      style={{
        borderColor: hanji.border,
        background: `${hanji.bg}F2`,
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="mx-auto max-w-3xl px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: hanji.dim }}
          >
            <ScrollIcon className="w-6 h-6" />
          </span>
          <div className="leading-tight">
            <h1 className="text-[18px] md:text-[20px] font-extrabold tracking-tight">
              김홍도 QR 방탈출 · 부착(Placing)
            </h1>
            <p className="text-xs" style={{ color: `${hanji.ink}B3` }}>
              한 문제씩 위치를 적고 저장한 뒤, 다음 문제로 이동하세요.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
