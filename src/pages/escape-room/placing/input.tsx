import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

// TODO: 세션 처리

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

  // 상태: 목록, 초점 인덱스(첫 미입력으로 이동), 부착체크
  const [items, setItems] = useState<SessionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [placedMap, setPlacedMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // flow 입력/저장 상태: 각 idx별 초안/저장/로딩/에러
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

        // draft/saved 초기화 (+ 마지막 항목은 완료 문구로 강제)
        const nextDraft: Record<number, string> = {};
        const nextSaved: Record<number, boolean> = {};

        // 자동 저장 필요 여부 체크용
        let needPersistCompletion = false;
        let completionIdxKey: number | null = null;
        let completionContentsId: number | null = null;

        normalized.forEach((it, i) => {
          const idx = it.question.idx ?? i;
          const isLast = i === normalized.length - 1;

          if (isLast) {
            // 마지막 문제는 무조건 완료 문구로 초기화
            nextDraft[idx] = COMPLETION_MSG;
            nextSaved[idx] =
              (it.question.nextLocation ?? "").trim() === COMPLETION_MSG;

            // DB 값이 다르면 이후 자동 저장
            if ((it.question.nextLocation ?? "").trim() !== COMPLETION_MSG) {
              needPersistCompletion = true;
              completionIdxKey = idx;
              completionContentsId = it.question.contentsId ?? CONTENTS_ID;
            }
          } else {
            const v = (it.question.nextLocation ?? "").trim();
            nextDraft[idx] = v;
            nextSaved[idx] = v.length > 0;
          }
        });

        setItems(normalized);
        setDraftMap(nextDraft);
        setSavedMap(nextSaved);

        // 첫 미입력 노드로 초점 이동
        const firstUnfilled = normalized.findIndex((it, i) =>
          i === normalized.length - 1 // 마지막은 항상 채워진 것으로 간주
            ? false
            : (it.question.nextLocation ?? "").trim().length === 0
        );
        setCurrentIndex(firstUnfilled >= 0 ? firstUnfilled : 0);

        // ★ 마지막 항목 완료 문구 자동 저장
        if (needPersistCompletion && completionIdxKey != null) {
          try {
            const res2 = await fetch("/api/escape-room/quiz/updateLocation", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id,
                contentsId: completionContentsId ?? CONTENTS_ID,
                idx: completionIdxKey,
                nextLocation: COMPLETION_MSG,
              }),
            });
            const payload = await res2.json().catch(() => ({}));
            if (!res2.ok || !payload?.ok)
              throw new Error(payload?.error || "저장 실패");

            // 상태 반영
            setItems((prev) =>
              prev.map((it, i) =>
                (it.question.idx ?? i) === completionIdxKey
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
            setSavedMap((m) => ({ ...m, [completionIdxKey!]: true }));
            setPlacedMap((m) => ({ ...m, [completionIdxKey!]: true }));
          } catch (e) {
            // 자동 저장 실패 시엔 화면은 완료 문구로 보이나, DB 반영만 실패
            // 필요 시 토스트/에러 배너 추가 가능
            console.error("자동 완료 저장 실패:", e);
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

  const total = items.length;
  const savedCount = Object.values(savedMap).filter(Boolean).length;
  const progressPct = total ? Math.round((savedCount / total) * 100) : 0;

  // 입력 변경
  const onChangeDraft = (idxKey: number, v: string) => {
    const vv = v.trim().toLowerCase();
    const safeV = vv === "null" || vv === "undefined" ? "" : v;
    setDraftMap((m) => ({ ...m, [idxKey]: safeV }));
    setSavedMap((m) => ({ ...m, [idxKey]: false }));
    setErrorMap((m) => ({ ...m, [idxKey]: "" }));
  };

  // 저장
  const saveOne = async (idxKey: number) => {
    const itemIdx = items.findIndex(
      (it, i) => (it.question.idx ?? i) === idxKey
    );
    if (itemIdx < 0) return;

    const isLast = itemIdx === items.length - 1;
    const clean = (draftMap[idxKey] ?? "").trim();

    if (!clean) {
      setErrorMap((m) => ({
        ...m,
        [idxKey]: isLast
          ? "종료 지점 위치를 입력하세요."
          : `${itemIdx + 2}번 문제 위치를 입력하세요.`,
      }));
      return;
    }

    setSavingMap((m) => ({ ...m, [idxKey]: true }));
    setErrorMap((m) => ({ ...m, [idxKey]: "" }));

    try {
      const user_id = localStorage.getItem("user_id") ?? undefined;
      const itemObj = items[itemIdx];
      const contentsId = itemObj.question.contentsId ?? CONTENTS_ID;

      const res = await fetch("/api/escape-room/quiz/updateLocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          contentsId,
          idx: idxKey,
          nextLocation: clean,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload?.ok) {
        throw new Error(payload?.error || "저장 실패");
      }

      // 상태 반영
      setItems((prev) =>
        prev.map((it, i) =>
          (it.question.idx ?? i) === idxKey
            ? { ...it, question: { ...it.question, nextLocation: clean } }
            : it
        )
      );
      setSavedMap((m) => ({ ...m, [idxKey]: true }));
      setPlacedMap((m) => ({ ...m, [idxKey]: true }));
    } catch (e: any) {
      setErrorMap((m) => ({
        ...m,
        [idxKey]: e?.message ?? "저장 오류가 발생했습니다.",
      }));
    } finally {
      setSavingMap((m) => ({ ...m, [idxKey]: false }));
    }
  };

  // 저장 후 다음으로 포커스/스크롤
  const saveAndGoNext = async (idxKey: number) => {
    await saveOne(idxKey);
    const curIdx = items.findIndex(
      (it, i) => (it.question.idx ?? i) === idxKey
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

      {/* 상단 진행 요약(저장 완료 진행률) */}
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
              총 {total}문항 · 저장 {savedCount}/{total}
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
            const isLast = i === items.length - 1;
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
                    {placedMap[idxKey] ? (
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
                </div>

                {/* 아래 화살표 */}
                <div className="flex justify-center my-2">
                  <ArrowDownIcon className="w-6 h-6" />
                </div>

                {/* 다음 힌트 위치 입력 노드 */}
                <div
                  className="rounded-2xl p-4 border shadow-sm"
                  style={{ background: "#fff", borderColor: hanji.border }}
                >
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="w-5 h-5 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">
                        {isLast
                          ? "종료 지점(마지막)"
                          : `${i + 2}번 문제 장소 힌트`}
                      </div>
                      {isLast ? (
                        <div className="mt-2 flex gap-2 flex-col sm:flex-row">
                          <p className="text-orange-500">
                            방탈출을 완료하셨습니다!
                          </p>
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
                            placeholder={
                              isLast
                                ? "2층 안내데스크(마지막 지점)"
                                : `${
                                    i + 2
                                  }번 문제 위치 예) 교탁 아래를 봐, 23번 사물함을 열어봐`
                            }
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
                              style={{ background: hanji.ink, color: hanji.bg }}
                            >
                              {isSaving ? "저장 중…" : "저장"}
                            </button>
                            {!isLast && (
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
                            )}
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
                        ) : isLast ? null : isSaved ? (
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
                {!isLast && (
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
              // 첫 미저장 노드로 점프
              const firstUnfilled = items.findIndex(
                (it, i) =>
                  (draftMap[it.question.idx ?? i] ?? "").trim().length === 0
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
              각 문제 아래에서 ‘다음 장소 힌트 위치’를 입력하고 저장하세요.
              (마지막은 종료 지점)
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
