// /pages/ai-quiz-walk/indoor/quiz/create.tsx
import { useRouter } from "next/router";
import { useState, useMemo, useEffect } from "react";
import { useQuizSession } from "@/store/useQuizSession.escape";
import type {
  Difficulty,
  SessionQuestion,
  Question,
} from "@/lib/frontend/quiz/types";

type HistoryStore = { questions: string[]; fingerprints: string[] };
const LS_KEY = "escape-room-question-history";

const normalize = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s\u00a0]+/g, " ")
    .replace(/[^a-z0-9\uac00-\ud7a3\s]/g, "")
    .trim();

function makeFingerprint(q: Question): string {
  const base = [
    q.topic ?? "",
    q.difficulty ?? "",
    q.question,
    ...(q.options ?? []),
    q.answer ?? "",
  ]
    .filter(Boolean)
    .join(" | ");
  return normalize(base);
}

function loadHistory(): HistoryStore {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { questions: [], fingerprints: [] };
    const parsed = JSON.parse(raw) as Partial<HistoryStore>;
    return {
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
      fingerprints: Array.isArray(parsed.fingerprints)
        ? parsed.fingerprints
        : [],
    };
  } catch {
    return { questions: [], fingerprints: [] };
  }
}
function saveHistory(next: HistoryStore) {
  localStorage.setItem(LS_KEY, JSON.stringify(next));
}

/** 전통 두루마리(Scroll) 아이콘 */
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

export default function NewQuestionPage() {
  const router = useRouter();
  const { sessionId, items, maxCount, addItem, reset } = useQuizSession();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [isLoading, setIsLoading] = useState(false);

  const generated = items.length;
  const progressPct = Math.round((generated / Math.max(maxCount, 1)) * 100);
  const remaining = maxCount - items.length;
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  const [history, setHistory] = useState<HistoryStore>({
    questions: [],
    fingerprints: [],
  });
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // 기존 suggestedChips 를 아래로 교체
  const suggestedChips = useMemo(
    () => [
      "김홍도의 생애와 호(단원)",
      "풍속화의 특징과 소재",
      "씨름도 속 숨은 단서 찾기",
      "서당 풍경과 아동 교육",
      "장터·주막의 직업과 생활사",
      "무동(춤)·음악과 민속놀이",
    ],
    []
  );

  const canGenerate = topic.trim().length > 0 && !isLoading && remaining > 0;

  const onGenerate = async () => {
    if (!canGenerate) return;
    setIsLoading(true);
    try {
      const previousQuestions = history.questions.slice(-50);
      const res = await fetch("/api/escape-room/quiz/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, previousQuestions }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error ?? "문제 생성에 실패했습니다.");
        return;
      }
      const data = (await res.json()) as Question;

      const fp = makeFingerprint(data);
      const nextHistory: HistoryStore = {
        questions: [...history.questions, data.question],
        fingerprints: [...history.fingerprints, fp],
      };
      saveHistory(nextHistory);
      setHistory(nextHistory);

      const qItem: SessionQuestion = { question: data };
      const index = addItem(qItem);
      router.replace(`/escape-room/questioning/quiz/${sessionId}/${index}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onSave = async () => {
    try {
      const res = await fetch("/api/escape-room/quiz/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, items, contentsId: 2 }),
      });
      if (!res.ok) throw new Error("save failed");
      await reset();
      alert("문제를 저장했습니다!");
      localStorage.removeItem(LS_KEY);
      await router.push("/escape-room/questioning/quiz/items");
    } catch {
      alert("문제 저장에 실패했습니다.");
    }
    // 성공
  };

  return (
    <main
      className="min-h-[100dvh] bg-[#f8f4ea]"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* 상단 헤더 : 한지 톤 + 전통 아이콘 */}
      <header className="sticky top-0 z-10 bg-[#f8f4ea]/90 backdrop-blur border-b border-[#e4d6ad]">
        <div className="mx-auto max-w-4xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[#5f513d]">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#efe6ce]">
              <ScrollIcon className="w-6 h-6" />
            </div>
            <div className="leading-tight">
              <h1 className="text-[18px] font-extrabold tracking-tight">
                김홍도 QR 방탈출 · 문제 생성
              </h1>
              <p className="text-xs text-[#5f513d]/70">
                주제 입력 → AI 생성 → 다음 화면에서 풀이
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-8 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <div className="rounded-2xl border border-[#e4d6ad] bg-white/95 shadow-[0_10px_30px_-12px_rgba(0,0,0,.20)] p-6">
          {/* 타이틀 블록 */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#5f513d]">
                전통 속 수수께끼, 어떤 문제를 만들까요?
              </h2>
              <p className="text-[#5f513d]/80 mt-1">
                주제를 입력하면, AI가 김홍도 테마에 맞는 문제를 만들어 드립니다.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {/* 주제 칩 */}
            <div className="flex flex-wrap gap-2 -m-1">
              {suggestedChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setTopic(chip)}
                  className={`m-1 px-3 py-2 rounded-full border text-sm min-h-10 active:scale-[0.98] transition
                    ${
                      topic === chip
                        ? "bg-[#5f513d] border-[#5f513d] text-[#f8f4ea] shadow"
                        : "bg-[#fff8db] border-[#e4d6ad] text-[#5f513d] hover:bg-[#fff2c4]"
                    }`}
                  aria-pressed={topic === chip}
                >
                  {topic === chip ? "✓ " : "# "}
                  {chip}
                </button>
              ))}
            </div>

            {/* 입력 */}
            <label className="block text-sm font-medium text-[#5f513d]">
              주제(키워드)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: 괴산의 역사, 산막이 옛길의 유래 등"
              className="w-full rounded-xl border border-[#e4d6ad] bg-white/95 px-4 py-3 text-[#5f513d] shadow-inner outline-none focus:ring-4 focus:ring-[#efe6ce]"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              enterKeyHint="go"
            />

            {/* 난이도 + 진행도 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#5f513d]">
                  난이도
                </label>
                <div className="flex gap-2">
                  {(
                    [
                      { key: "easy", label: "하" },
                      { key: "medium", label: "중" },
                      { key: "hard", label: "상" },
                    ] as const
                  ).map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setDifficulty(d.key as Difficulty)}
                      className={`flex-1 rounded-xl border px-3 py-3 text-sm min-h-12
                        ${
                          difficulty === d.key
                            ? "bg-[#5f513d] text-[#f8f4ea] border-[#5f513d]"
                            : "bg-[#fff8db] text-[#5f513d] border-[#e4d6ad] hover:bg-[#fff2c4]"
                        }`}
                      aria-pressed={difficulty === d.key}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2 md:col-span-2">
                <label className="text-sm font-medium text-[#5f513d]">
                  생성된 문제 수
                </label>
                <div className="rounded-xl border border-[#e4d6ad] bg-[#fff8db] px-3 py-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-[#5f513d]/80">
                    <span>
                      {generated} / {maxCount}
                    </span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#efe6ce] overflow-hidden">
                    <div
                      role="progressbar"
                      aria-label="생성 진행률"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progressPct}
                      className="h-full bg-[#5f513d] transition-[width] duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 생성 버튼 */}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={onGenerate}
                disabled={!canGenerate}
                className={`inline-flex w-full sm:w-auto items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-4 focus:ring-[#efe6ce] min-h-12
                  ${
                    canGenerate
                      ? "bg-[#5f513d] text-[#f8f4ea] hover:bg-[#4d4231] active:scale-[0.99]"
                      : "bg-[#efe6ce] text-[#8a7b62] cursor-not-allowed"
                  }`}
                aria-disabled={!canGenerate}
                aria-label="문제 생성하기"
              >
                <span className="inline-flex items-center gap-2">
                  {remaining > 0
                    ? "🧩 문제 생성하기"
                    : "문제를 모두 생성했습니다!"}
                </span>
              </button>
            </div>

            {remaining <= 0 && (
              <div>
                <button
                  type="button"
                  onClick={onSave}
                  className={`inline-flex w-full sm:w-auto items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-4 focus:ring-[#dce6ce] min-h-12
    bg-[#4d6b3b] text-[#f8f4ea] hover:bg-[#3d552f] active:scale-[0.99]`}
                  aria-label="문제 저장하기"
                >
                  <span className="inline-flex items-center gap-2">
                    문제 저장하기
                  </span>
                </button>

                <div className="flex justify-center items-center mt-5">
                  <button
                    className="inline-flex items-center text-sm text-[#b6412e]"
                    type="button"
                    onClick={() => reset()}
                  >
                    문제를 재생성하시겠습니까?
                  </button>
                </div>
              </div>
            )}

            <div className="mt-2 text-xs text-[#5f513d]/80">
              <button
                type="button"
                onClick={() => router.push(`/escape-room/questioning`)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#e4d6ad] px-4 py-3 text-sm min-h-12 bg-white/95 hover:bg-[#fff8db] active:scale-[0.99]"
                aria-label="뒤로 가기"
              >
                <span>←</span> 뒤로 가기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 페이지 하단 얕은 비네팅 */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-0 right-0 bottom-0 h-24"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,.05), rgba(0,0,0,0))",
        }}
      />
    </main>
  );
}
