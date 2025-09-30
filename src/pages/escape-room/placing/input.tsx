import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

/** ---------- 타입 ---------- */
type SessionQuestion = {
  question: {
    id?: string | number;
    idx?: number; // 화면용 고유 키
    topic: string;
    difficulty: string;
    question: string;
    options: string[];
    answer: string;
    nextLocation?: string | null;
    contentsId?: number | null;
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

/** ---------- 아이콘 ---------- */
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
function ArrowDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 4v14m0 0l-5-5m5 5l5-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
    </svg>
  );
}
function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/** ---------- 로컬스토리지 키 ---------- */
const LS_ITEMS = "placing:items";
const LS_PLACED = "placing:placed";
const LS_INDEX = "placing:currentIndex";

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
export default function PlacingInputPage() {
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

  // 상태: 목록, 초점 인덱스, 부착체크
  const [items, setItems] = useState<SessionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [placedMap, setPlacedMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // flow 입력/저장 상태
  const [draftMap, setDraftMap] = useState<Record<number, string>>({});
  const [savedMap, setSavedMap] = useState<Record<number, boolean>>({});
  const [savingMap, setSavingMap] = useState<Record<number, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<number, string>>({});

  // contentsId (필요 시 쿼리 등으로 대체)
  const CONTENTS_ID = 2;
  const COMPLETION_MSG = "방탈출을 완료하셨습니다!";

  // refs: 각 노드로 스크롤 이동
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // 복원
  useEffect(() => {
    const savedItems = safeParse<SessionQuestion[]>(
      localStorage.getItem(LS_ITEMS)
    );
    const savedPlaced = safeParse<Record<number, boolean>>(
      localStorage.getItem(LS_PLACED)
    );
    const savedIndex = safeParse<number>(localStorage.getItem(LS_INDEX));

    if (savedItems?.length) setItems(savedItems);
    if (savedPlaced) setPlacedMap(savedPlaced);
    if (typeof savedIndex === "number" && savedIndex >= 0)
      setCurrentIndex(savedIndex);
  }, []);

  // API 로드 (마운트 후 1회)
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const user_id = localStorage.getItem("user_id") ?? undefined;
        const res = await fetch("/api/escape-room/quiz/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id, contentsId: CONTENTS_ID }),
        });
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(t || `HTTP ${res.status}`);
        }
        const data = (await res.json()) as { items: SessionQuestion[] };

        // idx 정규화 + contentsId 보강
        const normalized = (data.items ?? []).map((it, i) => ({
          ...it,
          question: {
            ...it.question,
            idx: it.question.idx ?? i,
            contentsId: it.question.contentsId ?? CONTENTS_ID,
          },
        }));

        // draft/saved 초기화 규칙:
        // - i === 0 (1번 퀴즈): 입력 없음(고정) → draft "", saved true(표시용)
        // - i > 0: draft = (i-1).nextLocation, saved = 값 존재 여부
        const nextDraft: Record<number, string> = {};
        const nextSaved: Record<number, boolean> = {};

        const lastIdx = Math.max(normalized.length - 1, 0);

        normalized.forEach((it, i) => {
          const curKey = it.question.idx ?? i;
          if (i === 0) {
            nextDraft[curKey] = "";
            nextSaved[curKey] = true; // 진행률에서 제외할 것이므로 true/false는 큰 영향 없음
          } else {
            const prev = normalized[i - 1];
            const v = (prev?.question.nextLocation ?? "").trim();
            nextDraft[curKey] = v;
            nextSaved[curKey] = v.length > 0;
          }
        });

        setItems(normalized);
        setDraftMap(nextDraft);
        setSavedMap(nextSaved);

        // 첫 미입력 노드로 초점 이동 (2번부터 검사)
        const firstUnfilled = normalized.findIndex((_, i) =>
          i === 0
            ? false
            : (normalized[i - 1]?.question.nextLocation ?? "").trim().length ===
              0
        );
        setCurrentIndex(firstUnfilled >= 0 ? firstUnfilled : 0);

        // ★ 마지막 퀴즈의 nextLocation은 종착지 문구로 자동/유지
        if (
          normalized.length > 0 &&
          (normalized[lastIdx]?.question.nextLocation ?? "").trim() !==
            COMPLETION_MSG
        ) {
          try {
            const res2 = await fetch("/api/escape-room/quiz/updateLocation", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id,
                contentsId:
                  normalized[lastIdx].question.contentsId ?? CONTENTS_ID,
                idx: normalized[lastIdx].question.idx ?? lastIdx,
                nextLocation: COMPLETION_MSG,
              }),
            });
            const payload = await res2.json().catch(() => ({}));
            if (!res2.ok || !payload?.ok)
              throw new Error(payload?.error || "저장 실패");

            // 상태 반영
            const lastKey = normalized[lastIdx].question.idx ?? lastIdx;
            setItems((prev) =>
              prev.map((it, i) =>
                (it.question.idx ?? i) === lastKey
                  ? {
                      ...it,
                      question: {
                        ...it.question,
                        nextLocation: COMPLETION_MSG,
                      },
                    }
                  : it
              )
            );
            setPlacedMap((m) => ({ ...m, [lastKey]: true }));
          } catch (e) {
            console.error("마지막 종착지 자동 저장 실패:", e);
          }
        }
      } catch (e: any) {
        setError(e?.message ?? "목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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

  // 진행률: 2번~N번만 대상
  const total = items.length;
  const inputTargets = Math.max(total - 1, 0);
  const savedCount = items.reduce((acc, it, i) => {
    if (i === 0) return acc;
    const key = it.question.idx ?? i;
    return acc + (savedMap[key] ? 1 : 0);
  }, 0);
  const progressPct = inputTargets
    ? Math.round((savedCount / inputTargets) * 100)
    : 0;

  // 입력 변경
  const onChangeDraft = (idxKey: number, v: string) => {
    const vv = v.trim().toLowerCase();
    const safeV = vv === "null" || vv === "undefined" ? "" : v;
    setDraftMap((m) => ({ ...m, [idxKey]: safeV }));
    setSavedMap((m) => ({ ...m, [idxKey]: false }));
    setErrorMap((m) => ({ ...m, [idxKey]: "" }));
  };

  // 저장 대상 key 계산: (현재-1)
  const getTargetPrevIdxKey = (curIdxKey: number) => {
    const curIdx = items.findIndex(
      (it, i) => (it.question.idx ?? i) === curIdxKey
    );
    if (curIdx <= 0) return null;
    const prevKey = items[curIdx - 1].question.idx ?? curIdx - 1;
    return { prevKey, prevIdx: curIdx - 1, curIdx };
  };

  // 저장: 현재 카드의 입력값을 (현재-1)의 nextLocation으로 저장
  const saveOne = async (curIdxKey: number) => {
    const ref = getTargetPrevIdxKey(curIdxKey);
    if (!ref) return; // 1번은 저장 없음(고정)
    const { prevKey, prevIdx, curIdx } = ref;

    const clean = (draftMap[curIdxKey] ?? "").trim();
    if (!clean) {
      setErrorMap((m) => ({
        ...m,
        [curIdxKey]: `${curIdx + 1}번 퀴즈의 실제 위치를 입력하세요.`,
      }));
      return;
    }

    setSavingMap((m) => ({ ...m, [curIdxKey]: true }));
    setErrorMap((m) => ({ ...m, [curIdxKey]: "" }));

    try {
      const user_id = localStorage.getItem("user_id") ?? undefined;
      const targetObj = items[prevIdx]; // 저장 대상은 이전 퀴즈
      const contentsId = targetObj.question.contentsId ?? 2;

      const res = await fetch("/api/escape-room/quiz/updateLocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          contentsId,
          idx: prevKey,
          nextLocation: clean,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload?.ok) {
        throw new Error(payload?.error || "저장 실패");
      }

      // 상태 반영:
      // (현재-1)의 nextLocation 업데이트
      setItems((prev) =>
        prev.map((it, i) =>
          (it.question.idx ?? i) === prevKey
            ? { ...it, question: { ...it.question, nextLocation: clean } }
            : it
        )
      );
      // 현재 카드 저장 완료 플래그
      setSavedMap((m) => ({ ...m, [curIdxKey]: true }));
      setPlacedMap((m) => ({ ...m, [curIdxKey]: true }));
    } catch (e: any) {
      setErrorMap((m) => ({
        ...m,
        [curIdxKey]: e?.message ?? "저장 오류가 발생했습니다.",
      }));
    } finally {
      setSavingMap((m) => ({ ...m, [curIdxKey]: false }));
    }
  };

  // 저장 후 다음으로 포커스/스크롤
  const saveAndGoNext = async (curIdxKey: number) => {
    await saveOne(curIdxKey);
    const curIdx = items.findIndex(
      (it, i) => (it.question.idx ?? i) === curIdxKey
    );
    const nextIdx = curIdx + 1;
    if (nextIdx < items.length) {
      const nextKey = items[nextIdx].question.idx ?? nextIdx;
      setCurrentIndex(nextIdx);
      nodeRefs.current[nextKey]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // 로딩/에러/빈 상태
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: hanji.bg, color: hanji.ink }}
      >
        <div
          className="rounded-2xl border px-6 py-5 shadow-sm"
          style={{ background: "#fff", borderColor: hanji.border }}
        >
          목록을 불러오는 중입니다…
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: hanji.bg, color: hanji.ink }}
      >
        <div
          className="rounded-2xl border px-6 py-5 shadow-sm space-y-2"
          style={{ background: "#fff", borderColor: hanji.border }}
        >
          <p>문제 목록을 불러오지 못했습니다.</p>
          <p className="text-sm" style={{ color: `${hanji.ink}B3` }}>
            {error}
          </p>
          <button
            onClick={() => location.reload()}
            className="rounded-xl px-4 py-2 font-semibold hover:opacity-90"
            style={{ background: hanji.ink, color: hanji.bg }}
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }
  if (total === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: hanji.bg, color: hanji.ink }}
      >
        <div
          className="rounded-2xl border px-6 py-5 shadow-sm space-y-2"
          style={{ background: "#fff", borderColor: hanji.border }}
        >
          표시할 문제가 없습니다.
          <Link
            href="/escape-room/placing"
            className="inline-block rounded-xl px-4 py-2 font-semibold hover:opacity-90"
            style={{ background: hanji.ink, color: hanji.bg }}
          >
            뒤로 가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: hanji.bg, color: hanji.ink }}
    >
      <Header hanji={hanji} />

      {/* 상단 진행 요약(저장 완료 진행률: 2번~N번) */}
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
              총 {total}문항 · 저장 {savedCount}/{inputTargets}
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

      {/* 흐름도 편집 영역 */}
      <main className="mx-auto max-w-3xl px-5 py-6">
        <ol className="relative">
          {items.map((it, i) => {
            const idxKey = it.question.idx ?? i;
            const isFirst = i === 0;
            const draft = draftMap[idxKey] ?? "";
            const isSaving = savingMap[idxKey] ?? false;
            const isSaved = savedMap[idxKey] ?? false;
            const errMsg = errorMap[idxKey] ?? "";

            return (
              <li key={idxKey} className="mb-6">
                {/* 문제 노드 */}
                <div
                  ref={(el) => {
                    nodeRefs.current[idxKey] = el;
                  }}
                  className={`rounded-2xl p-5 border shadow-sm ${
                    currentIndex === i ? "ring-2" : ""
                  }`}
                  style={{
                    background: "#fff",
                    borderColor: hanji.border,
                    boxShadow:
                      currentIndex === i
                        ? "0 0 0 2px rgba(95,81,61,0.15) inset"
                        : undefined,
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg text-xs font-semibold px-2"
                      style={{ background: hanji.dim, color: "#6b5b43" }}
                    >
                      #{i + 1}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: `${hanji.ink}CC` }}
                    >
                      주제:{" "}
                      <b style={{ color: hanji.ink }}>{it.question.topic}</b>
                    </span>
                    <span
                      className="hidden sm:inline text-xs"
                      style={{ color: `${hanji.ink}80` }}
                    >
                      · 난이도: {it.question.difficulty}
                    </span>
                    {isFirst ? (
                      <span
                        className="ml-auto text-xs rounded-md px-2 py-1"
                        style={{
                          background: "#eef2ff",
                          color: "#3730a3",
                          border: "1px solid #c7d2fe",
                        }}
                      >
                        고정
                      </span>
                    ) : placedMap[idxKey] ? (
                      <span
                        className="ml-auto text-xs rounded-md px-2 py-1"
                        style={{
                          background: "#eaf7ea",
                          color: "#145a14",
                          border: "1px solid #b7e0b7",
                        }}
                      >
                        저장됨
                      </span>
                    ) : null}
                  </div>

                  <p
                    className="font-semibold mt-3"
                    style={{ color: hanji.ink }}
                  >
                    {it.question.question}
                  </p>
                  {it.question.answer ? (
                    <p
                      className="mt-2 text-xs"
                      style={{ color: `${hanji.ink}80` }}
                    >
                      정답: {it.question.answer}
                    </p>
                  ) : null}
                  <div className="flex items-start gap-2 mt-4">
                    <MapPinIcon className="w-5 h-5 mt-0.5" />
                    <div className="flex-1">
                      <div
                        className="text-sm font-semibold"
                        style={{ color: "#145a14" }}
                      >
                        {isFirst ? "시작 지점(고정)" : "퀴즈 위치 힌트 입력"}
                      </div>

                      {isFirst ? (
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className="text-xs rounded-md px-2 py-1"
                            style={{
                              background: "#eef2ff",
                              color: "#3730a3",
                              border: "1px solid #c7d2fe",
                            }}
                          >
                            고정
                          </span>
                          <span
                            className="text-sm"
                            style={{ color: `${hanji.ink}80` }}
                          >
                            첫 번째 퀴즈 위치는 고정입니다.
                          </span>
                        </div>
                      ) : (
                        <div className="mt-2 flex gap-2 flex-col sm:flex-row">
                          <input
                            type="text"
                            value={draft}
                            onFocus={() => setCurrentIndex(i)}
                            onChange={(e) =>
                              onChangeDraft(idxKey, e.target.value)
                            }
                            placeholder={`교탁 밑을 보세요, 칠판을 확인하세요`}
                            maxLength={80}
                            className="w-full rounded-xl px-4 py-3 outline-none"
                            style={{
                              background: hanji.paper,
                              border: `1px solid ${hanji.border}`,
                              color: hanji.ink,
                            }}
                          />
                          <div className="shrink-0 flex gap-2">
                            <button
                              type="button"
                              onClick={() => saveOne(idxKey)}
                              disabled={isSaving || !draft.trim()}
                              className="rounded-xl px-4 py-3 font-semibold hover:opacity-90 disabled:opacity-50"
                              style={{
                                background: hanji.ink,
                                color: hanji.bg,
                              }}
                            >
                              {isSaving ? "저장 중…" : "저장"}
                            </button>

                            <button
                              type="button"
                              onClick={() => saveAndGoNext(idxKey)}
                              disabled={isSaving || !draft.trim()}
                              className="rounded-xl px-4 py-3 font-semibold hover:opacity-90 disabled:opacity-50"
                              style={{
                                background: "#fff",
                                border: `1px solid ${hanji.border}`,
                                color: hanji.ink,
                              }}
                            >
                              저장 후 다음
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 상태 메시지 */}
                      <div className="min-h-[1.25rem] mt-1">
                        {errMsg ? (
                          <span
                            className="text-sm"
                            style={{ color: "#b6412e" }}
                          >
                            {errMsg}
                          </span>
                        ) : !isFirst && isSaved ? (
                          <span
                            className="text-sm"
                            style={{ color: "#145a14" }}
                          >
                            저장되었습니다.
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 다음 문제 카드로 이어지는 화살표 */}
                {i < items.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ArrowDownIcon className="w-6 h-6" />
                  </div>
                )}
              </li>
            );
          })}

          {/* 종료 노드 */}
          <li>
            <div
              className="mx-auto w-fit rounded-full px-4 py-2 text-sm font-semibold"
              style={{
                background: hanji.ink,
                color: hanji.bg,
                boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
              }}
            >
              종료
            </div>
          </li>
        </ol>
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
          <button
            onClick={() => {
              // 첫 미저장 노드로 점프 (2번부터 검사)
              const firstUnfilled = items.findIndex((_, i) =>
                i === 0
                  ? false
                  : (items[i - 1]?.question.nextLocation ?? "").trim()
                      .length === 0
              );
              const targetIdx = firstUnfilled >= 0 ? firstUnfilled : 0;
              setCurrentIndex(targetIdx);
              const key = items[targetIdx]?.question.idx ?? targetIdx;
              nodeRefs.current[key]?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            className="rounded-xl px-4 py-3 font-semibold hover:opacity-90"
            style={{ background: hanji.ink, color: hanji.bg }}
          >
            미입력 힌트로 이동
          </button>
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

      {/* 프린트 간소화 */}
      <style jsx global>{`
        @media print {
          footer {
            display: none;
          }
          header {
            position: static !important;
          }
          .shadow-sm {
            box-shadow: none !important;
          }
        }
      `}</style>
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
              김홍도 QR 방탈출 제작하기
            </h1>
            <p className="text-xs" style={{ color: `${hanji.ink}B3` }}>
              각 문제 아래에서 ‘퀴즈 위치 힌트’를 입력하고 저장하세요.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
