import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router"; // Page Router
import { useQuizSession } from "@/store/useQuizSession.escape";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import type { Question } from "@/lib/frontend/quiz/types";

type HistoryStore = { questions: string[]; fingerprints: string[] };
const LS_KEY = "escape-room-question-history";

// normalize
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

export default function QuizPagess() {
  const router = useRouter();
  const { sessionId, items, setAnswer, maxCount, reset } = useQuizSession();
  const { sessionId: sidParam, index: indexParam } = router.query;

  const [history, setHistory] = useState<HistoryStore>({
    questions: [],
    fingerprints: [],
  });
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const idx = useMemo<number>(() => {
    if (Array.isArray(indexParam)) return Number(indexParam[0]);
    if (typeof indexParam === "string") return Number(indexParam);
    return NaN;
  }, [indexParam]);

  const [localAnswer, setLocalAnswer] = useState<string>("");
  const [regenerating, setRegenerating] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("user_id"));
    }
  }, []);

  // 라우트 검증
  useEffect(() => {
    if (!router.isReady) return;
    if (typeof sidParam === "string" && sidParam !== sessionId) {
      router.replace("/escape-room/questioning/quiz/create");
      return;
    }
    if (!Number.isFinite(idx) || idx < 0 || idx >= items.length) {
      router.replace("/escape-room/questioning/quiz/create");
      return;
    }
  }, [router.isReady, sidParam, sessionId, idx, items, router]);

  const isSubmitEnabled = localAnswer.length > 0;

  const notReady =
    !router.isReady || !Number.isFinite(idx) || idx < 0 || idx >= items.length;
  if (notReady) return null;

  const item = items[idx];

  const onSubmit = () => {
    if (!isSubmitEnabled) return;
    setAnswer(idx, localAnswer);
    setSubmitted(true);
  };

  const onChoose = async () => {
    const nextIndex = idx + 1;
    router.replace("/escape-room/questioning/quiz/create");
  };

  const onRegenerate = async () => {
    if (!submitted || regenerating) return;
    setRegenerating(true);
    try {
      const previousQuestions = history.questions.slice(-50);
      const result = await fetch("/api/escape-room/quiz/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: item.question.topic,
          difficulty: item.question.difficulty,
          previousQuestions,
        }),
      });
      if (!result.ok) {
        const err = await result.json().catch(() => ({}));
        alert(err?.error ?? "문제 생성에 실패했습니다.");
        setRegenerating(false);
        return;
      }
      const data = (await result.json()) as Question;
      const fp = makeFingerprint(data);
      const nextHistory: HistoryStore = {
        questions: [...history.questions, data.question],
        fingerprints: [...history.fingerprints, fp],
      };
      saveHistory(nextHistory);
      setHistory(nextHistory);
      useQuizSession.getState().replaceQuestionAt(idx, data);
      setLocalAnswer("");
      setSubmitted(false);
    } catch (error) {
      console.error("문제 재생성 실패:", error);
      alert("문제 재생성 중 오류가 발생했습니다.");
    } finally {
      setRegenerating(false);
    }
  };

  const onDelete = () => {
    useQuizSession.getState().pop();
    router.replace("/escape-room/questioning/quiz/create");
  };

  // 한지 팔레트
  const hanji = {
    bg: "#f8f4ea",
    ink: "#5f513d",
    paper: "#fffdf3",
    chip: "#fff8db",
    border: "#e4d6ad",
    accent: "#b6412e",
    dim: "#efe6ce",
  };

  // 선택지 앞 글자(A-D)
  const letters = ["A", "B", "C", "D"];

  // 진행률
  const progress = Math.round(((idx + 1) / Math.max(maxCount, 1)) * 100);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: hanji.bg, color: hanji.ink }}
    >
      {/* 헤더 */}
      <header
        className="sticky top-0 z-20 border-b"
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
                김홍도 QR 방탈출 · 문제 {idx + 1} / {maxCount}
              </h1>
              <p className="text-xs" style={{ color: `${hanji.ink}B3` }}>
                주제: {item.question.topic} · 객관식
              </p>
            </div>
          </div>
        </div>
        {/* 진행 바 */}
        <div className="h-2 w-full" style={{ background: hanji.dim }}>
          <div
            className="h-full transition-[width] duration-500"
            style={{ width: `${progress}%`, background: hanji.ink }}
          />
        </div>
      </header>

      {/* 본문 */}
      <main className="flex-1 mx-auto w-full max-w-3xl px-5 pt-6 pb-[120px]">
        <article
          className="rounded-2xl p-6 shadow-[0_10px_30px_-12px_rgba(0,0,0,.20)]"
          style={{ background: "#ffffff", border: `1px solid ${hanji.border}` }}
        >
          <h2 className="text-lg md:text-xl font-bold leading-relaxed mb-4">
            {item.question.question}
          </h2>

          {/* 보기: 카드형 버튼 */}
          <ul className="space-y-3 mb-4">
            {item.question.options.map((opt: string, i: number) => {
              const selected = localAnswer === opt;
              return (
                <li key={i}>
                  <label
                    className="group flex items-center gap-3 rounded-2xl px-4 py-3 cursor-pointer transition active:scale-[0.99] border"
                    style={{
                      borderColor: selected ? hanji.ink : hanji.border,
                      background: selected ? "#fff" : hanji.chip,
                      boxShadow: selected
                        ? "0 4px 14px rgba(0,0,0,.08)"
                        : "none",
                    }}
                  >
                    <input
                      type="radio"
                      name="mc"
                      value={opt}
                      checked={selected}
                      onChange={(e) => setLocalAnswer(e.target.value)}
                      className="sr-only"
                      aria-label={`보기 ${letters[i]}: ${opt}`}
                    />
                    <span
                      className="inline-flex items-center justify-center rounded-xl w-8 h-8 text-sm font-bold shrink-0"
                      style={{
                        background: selected ? hanji.ink : hanji.dim,
                        color: selected ? hanji.bg : "#6b5b43",
                      }}
                      aria-hidden
                    >
                      {letters[i] ?? String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1 leading-snug">{opt}</span>
                  </label>
                </li>
              );
            })}
          </ul>

          {/* 정답 피드백 (스크린리더용 라이브 영역 포함) */}
          <div aria-live="polite">
            {submitted &&
              (localAnswer === item.question.answer ? (
                <div
                  className="mt-2 rounded-2xl p-4 border"
                  style={{
                    background: "#ecf8ee",
                    borderColor: "#bfe6c6",
                    color: "#145a14",
                  }}
                >
                  <p className="font-semibold">
                    정답! <span className="font-normal">정답은 </span>
                    <span className="font-bold">{item.question.answer}</span>
                  </p>
                </div>
              ) : (
                <div
                  className="mt-2 rounded-2xl p-4 border"
                  style={{
                    background: "#fdeeee",
                    borderColor: "#f3c2c2",
                    color: "#7a1d1d",
                  }}
                >
                  <p className="font-semibold">
                    아쉬워요! <span className="font-normal">정답은 </span>
                    <span className="font-bold">{item.question.answer}</span>
                  </p>
                </div>
              ))}
          </div>
        </article>
      </main>

      {/* 하단 고정 액션바 */}
      <div
        className="fixed left-0 right-0 bottom-0 z-30 border-t"
        style={{
          background: "#ffffffF2",
          borderColor: hanji.border,
          backdropFilter: "blur(6px)",
        }}
      >
        <div className="mx-auto max-w-3xl px-5 py-3 flex flex-wrap gap-2 items-center">
          {/* 제출 */}
          {!submitted ? (
            <button
              disabled={!isSubmitEnabled}
              onClick={onSubmit}
              className={`rounded-xl px-4 py-3 font-semibold min-h-12 transition ${
                !isSubmitEnabled ? "cursor-not-allowed" : "active:scale-[0.99]"
              }`}
              style={{
                background: isSubmitEnabled ? hanji.ink : hanji.dim,
                color: isSubmitEnabled ? hanji.bg : "#8a7b62",
              }}
              aria-disabled={!isSubmitEnabled}
              aria-label="제출하고 정답 확인"
            >
              제출하고 정답 확인
            </button>
          ) : (
            <>
              <button
                disabled={!submitted}
                onClick={onChoose}
                className="rounded-xl px-4 py-3 font-semibold min-h-12 hover:opacity-90 active:scale-[0.99]"
                style={{ background: hanji.ink, color: hanji.bg }}
                aria-label="이 문제 사용 확정"
              >
                이 문제 사용할래요
              </button>

              <button
                onClick={onRegenerate}
                disabled={!submitted || regenerating}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm min-h-12 ${
                  !submitted || regenerating
                    ? "opacity-60 cursor-not-allowed"
                    : "active:scale-[0.99]"
                }`}
                style={{
                  borderColor: hanji.border,
                  background: "#fff",
                  color: hanji.ink,
                }}
                aria-disabled={!submitted || regenerating}
                aria-label="같은 주제로 다시 생성"
                title={!submitted ? "정답 확인 후 다시 만들 수 있어요" : ""}
              >
                <ArrowPathIcon
                  className={`h-5 w-5 ${regenerating ? "animate-spin" : ""}`}
                  aria-hidden
                />
                {regenerating ? "다시 만드는 중…" : "이 주제로 재생성하기"}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onDelete}
            className="ml-auto inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm min-h-12 active:scale-[0.99]"
            style={{
              borderColor: hanji.border,
              background: "#fff",
              color: hanji.ink,
            }}
            aria-label="뒤로 가기"
          >
            <span aria-hidden>←</span> 뒤로 가기
          </button>
        </div>
      </div>

      {/* 전용 스타일 */}
      <style jsx global>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
