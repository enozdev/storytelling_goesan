import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router"; // Page Router
import { useQuizSession } from "@/store/useQuizSession";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import type { Question, SessionQuestion } from "@/lib/frontend/quiz/types";

export default function QuizPagess() {
  const router = useRouter();
  const { sessionId, items, setAnswer, maxCount } = useQuizSession();

  const { sessionId: sidParam, index: indexParam } = router.query;

  const idx = useMemo<number>(() => {
    if (Array.isArray(indexParam)) return Number(indexParam[0]);
    if (typeof indexParam === "string") return Number(indexParam);
    return NaN;
  }, [indexParam]);

  const [localAnswer, setLocalAnswer] = useState<string>("");
  const [regenerating, setRegenerating] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // idx/세션 검증 및 초기 답안 로드
  useEffect(() => {
    if (!router.isReady) return;

    // 세션 불일치 시 요약으로 이동
    if (typeof sidParam === "string" && sidParam !== sessionId) {
      router.replace("/ai-quiz-walk/indoor/quiz/list");
      return;
    }

    if (!Number.isFinite(idx) || idx < 0 || idx >= items.length) {
      router.replace("/ai-quiz-walk/indoor/quiz/list");
      return;
    }
  }, [router.isReady, sidParam, sessionId, idx, items, router]);

  // 제출 버튼 활성화
  const isSubmitEnabled = localAnswer.length > 0;

  // 훅 이후에 조건부 렌더링 수행 (훅 호출 순서 불변)
  const notReady =
    !router.isReady || !Number.isFinite(idx) || idx < 0 || idx >= items.length;

  if (notReady) {
    // 로딩/안전 처리
    return null;
  }

  const item = items[idx];

  const onSubmit = () => {
    if (!isSubmitEnabled) return;
    setAnswer(idx, localAnswer);
    setSubmitted(true); // 정답 노출/저장 버튼 활성화
  };

  // Not Use Now //
  // DB 수정 후 사용할 예정 //
  const onChoose = async () => {
    const it = items[idx];
    try {
      const res = await fetch("/api/user/question/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: it.question.topic,
          difficulty: it.question.difficulty,
          q: it.question.question,
          options: it.question.options,
          a: it.question.answer,
          userAnswer: localAnswer,
        }),
        credentials: "include",
      });
      const j = await res.json();
      if (!res.ok) {
        alert(j?.error ?? "DB 저장 실패");
      } else {
        console.log("saved:", j.publicUrl);
      }
    } catch (e) {
      console.error(e);
    }

    const nextIndex = idx + 1;
    if (nextIndex < maxCount) {
      router.replace("/ai-quiz-walk/indoor/quiz/create");
    } else {
      router.replace("/ai-quiz-walk/indoor/quiz/draftItems");
    }
  };

  // 재생성 함수 //
  const onRegenerate = async () => {
    if (!submitted || regenerating) return; // 제출 후에만 재생성 허용 조건 유지 시
    setRegenerating(true);
    try {
      const result = await fetch("/api/ai-quiz-walk/quiz/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: item.question.topic,
          difficulty: item.question.difficulty,
        }),
      });

      if (!result.ok) {
        const err = await result.json().catch(() => ({}));
        alert(err?.error ?? "문제 생성에 실패했습니다.");
        setRegenerating(false);
        return;
      }
      const raw = await result.json();
      const normalized =
        "q" in raw
          ? {
              // UI가 item.question.question / answer 를 쓰는 경우에 맞춤
              question: raw.question,
              options: raw.options,
              answer: raw.answer,
              topic: raw.topic,
              difficulty: raw.difficulty,
            }
          : raw;

      // 기존 인덱스의 문제를 "교체" (길이 유지 → 개수 증가 없음)
      useQuizSession.getState().replaceQuestionAt(idx, normalized);

      // 로컬 제출/선택 상태 초기화 (새 문제니까)
      setLocalAnswer("");
      setSubmitted(false);
    } catch (error) {
      console.error("문제 재생성 실패:", error);
      alert("문제 재생성 중 오류가 발생했습니다.");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">
          문제 {idx + 1} / {maxCount}
        </h1>
        <p className="text-slate-600">
          주제: {item.question.topic} · 형식: 객관식
        </p>
      </header>

      <div className="rounded-2xl border p-6 bg-white">
        <p className="font-medium mb-4">{item.question.question}</p>

        <ul className="space-y-2 mb-4">
          {item.question.options.map((opt: string, i: number) => (
            <li key={i}>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="mc"
                  value={opt}
                  checked={localAnswer === opt}
                  onChange={(e) => setLocalAnswer(e.target.value)}
                />
                <span>{opt}</span>
              </label>
            </li>
          ))}
        </ul>

        {!submitted ? (
          <button
            disabled={!isSubmitEnabled}
            onClick={onSubmit}
            className={`rounded-xl px-4 py-3 font-semibold ${
              !isSubmitEnabled
                ? "bg-slate-200 text-slate-500"
                : "bg-emerald-600 text-white"
            }`}
          >
            제출하고 정답 확인
          </button>
        ) : (
          <div className="mt-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
            <p className="text-emerald-800">
              정답:{" "}
              <span className="font-semibold">{item.question.answer}</span>
            </p>
            <p className="text-slate-600 mt-1">
              내 답안: {localAnswer || "(미입력)"}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {/* 확정 버튼: 제출 후 활성화 */}
          <button
            disabled={!submitted}
            onClick={onChoose}
            className={`rounded-xl px-4 py-3 font-semibold min-h-12 ${
              !submitted
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.99]"
            }`}
            aria-disabled={!submitted}
            aria-label="이 문제를 사용으로 확정합니다"
          >
            이 문제 사용할래요
          </button>

          {/* 재생성 버튼: 제출 후에만 가능 */}
          <button
            onClick={onRegenerate}
            disabled={!submitted || regenerating}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm min-h-12
              ${
                !submitted || regenerating
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-slate-50 active:scale-[0.99]"
              }`}
            aria-disabled={!submitted || regenerating}
            aria-label="같은 주제로 문제를 다시 생성합니다"
            title={!submitted ? "정답 확인 후 다시 만들 수 있어요" : ""}
          >
            <ArrowPathIcon
              className={`h-5 w-5 ${regenerating ? "animate-spin" : ""}`}
              aria-hidden
            />
            {regenerating ? "다시 만드는 중…" : "이 주제로 재생성하기"}
          </button>

          <p className="w-full text-sm text-slate-500 mt-1">
            AI는 유사한 문제를 생성할 수도 있어요! <br />
            그럴땐 주제를 바꾸거나 다시 시도해 보세요.
          </p>
        </div>
      </div>
    </main>
  );
}
