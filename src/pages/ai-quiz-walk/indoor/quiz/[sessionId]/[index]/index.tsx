import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router"; // ✅ Page Router
import { useQuizSession } from "@/store/quizSession";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

export default function PlayPage() {
  const router = useRouter();
  const { sessionId, items, setAnswer, reveal, choose, maxCount } =
    useQuizSession();

  const { sessionId: sid, index } = router.query;
  // 컴포넌트 내부 상단에 추가
  const [regenerating, setRegenerating] = useState(false);

  // 재생성 핸들러
  const onRegenerate = () => {
    if (!item.isRevealed || regenerating) return;
    setRegenerating(true);

    // 같은 주제로 다시 만들러 이동 (경로는 프로젝트에 맞게)
    // 기존에 create를 쓰셨다면 그대로 두고, new를 쓰고 있으면 아래 줄만 교체하세요.
    router.push("/ai-quiz-walk/indoor/quiz/create");
    // router.push(`/ai-quiz-walk/indoor/quiz/new?topic=${encodeURIComponent(item.question.topic)}&redo=1`);
  };

  const idx = useMemo(() => {
    if (Array.isArray(index)) return Number(index[0]);
    if (typeof index === "string") return Number(index);
    return NaN;
  }, [index]);

  const [localAnswer, setLocalAnswer] = useState<string>("");

  useEffect(() => {
    if (!router.isReady) return;

    // 세션 불일치 → 요약으로
    if (typeof sid === "string" && sid !== sessionId) {
      router.replace("/ai-quiz-walk/indoor/quiz/summary");
      return;
    }

    if (!Number.isFinite(idx) || idx < 0 || idx >= items.length) {
      router.replace("/ai-quiz-walk/indoor/quiz/summary");
      return;
    }

    const item = items[idx];
    setLocalAnswer(item?.userAnswer ?? "");
  }, [router.isReady, sid, sessionId, idx, items, router]);

  if (
    !router.isReady ||
    !Number.isFinite(idx) ||
    idx < 0 ||
    idx >= items.length
  ) {
    return null; // 로딩/안전 처리
  }

  const item = items[idx];
  const isSubmitEnabled = useMemo(() => localAnswer.length > 0, [localAnswer]);

  const onSubmit = () => {
    if (!isSubmitEnabled) return;
    setAnswer(idx, localAnswer);
    reveal(idx);
  };

  const onChoose = async () => {
    choose(idx);
    const item = items[idx];

    try {
      const res = await fetch("/api/user/question/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: item.question.topic,
          difficulty: item.question.difficulty,
          q: item.question.q,
          options: item.question.options,
          a: item.question.a,
        }),
        credentials: "include", // 세션 쿠키 포함(중요)
      });
      const j = await res.json();
      if (!res.ok) {
        alert(j?.error ?? "DB 저장 실패");
      } else {
        console.log("saved:", j.publicUrl);
        // 필요하면 요약 페이지에서 링크/QR 버튼 노출
      }
    } catch (e) {
      console.error(e);
    }

    const nextIndex = idx + 1;
    if (nextIndex < maxCount)
      router.replace("/ai-quiz-walk/indoor/quiz/create");
    else router.replace("/ai-quiz-walk/indoor/quiz/list");
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
        <p className="font-medium mb-4">{item.question.q}</p>

        <ul className="space-y-2 mb-4">
          {item.question.options.map((opt: any, i: any) => (
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

        {!item.isRevealed ? (
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
              정답: <span className="font-semibold">{item.question.a}</span>
            </p>
            <p className="text-slate-600 mt-1">
              내 답안: {item.userAnswer ?? "(미입력)"}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {/* 확정 버튼 (주 CTA) */}
          <button
            disabled={!item.isRevealed}
            onClick={onChoose}
            className={`rounded-xl px-4 py-3 font-semibold min-h-12 ${
              !item.isRevealed
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.99]"
            }`}
            aria-disabled={!item.isRevealed}
            aria-label="이 문제를 사용으로 확정합니다"
          >
            이 문제 사용할래요
          </button>

          {/* 재생성 버튼 (보조 CTA) */}
          <button
            onClick={onRegenerate}
            disabled={!item.isRevealed || regenerating}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm min-h-12
      ${
        !item.isRevealed || regenerating
          ? "opacity-60 cursor-not-allowed"
          : "hover:bg-slate-50 active:scale-[0.99]"
      }
    `}
            aria-disabled={!item.isRevealed || regenerating}
            aria-label="같은 주제로 문제를 다시 생성합니다"
            title={!item.isRevealed ? "정답 확인 후 다시 만들 수 있어요" : ""}
          >
            <ArrowPathIcon
              className={`h-5 w-5 ${regenerating ? "animate-spin" : ""}`}
              aria-hidden
            />
            {regenerating ? "다시 만드는 중…" : "이 주제로 재생성하기"}
          </button>

          {/* 안내 텍스트 (정답 확인 전) */}
          {!item.isRevealed && (
            <p className="w-full text-xs text-slate-500 mt-1">
              정답 확인 후 확정/재생성할 수 있습니다.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
