// pages/ai-quiz-walk/indoor/quiz/qr/index.tsx
import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import type { Question } from "@/lib/frontend/quiz/types";
import { useRouter } from "next/router";

const LS_COLOR_KEY = "qrThemeColor";
const DEFAULT_COLOR = "#ef4444"; // 빨강(red-500)

// ──────────────────────────────────────────────────────────────
// 1) 김홍도 전용 문제 세트 (로컬 폴백)
//    기존 dummy(SessionQuestion[])를 Question[]으로 평탄화
// ──────────────────────────────────────────────────────────────
const KIMHONGDO_ITEMS: Question[] = [
  {
    id: "1",
    question: "단원 김홍도의 호(號)는 무엇일까요?",
    options: ["단원", "혜원", "겸재", "청명"],
    answer: "단원",
    difficulty: "easy",
    topic: "김홍도",
  },
  {
    id: "2",
    question: "김홍도가 특히 뛰어났던 화풍으로 알려진 것은?",
    options: ["풍속화", "초상화", "불화", "추상화"],
    answer: "풍속화",
    difficulty: "easy",
    topic: "김홍도",
  },
  {
    id: "3",
    question:
      "다음 중 김홍도의 ‘씨름’과 같은 계열의 풍속 장면으로 보기 어려운 것은?",
    options: ["서당", "씨름", "무동", "금강전도"],
    answer: "금강전도",
    difficulty: "medium",
    topic: "김홍도",
  },
  {
    id: "4",
    question: "김홍도의 작품 활동과 가장 밀접한 조선 후기 임금은 누구일까요?",
    options: ["세종", "영조", "정조", "순조"],
    answer: "정조",
    difficulty: "medium",
    topic: "김홍도",
  },
  {
    id: "5",
    question: "다음 중 김홍도의 대표적 풍속화 제목은?",
    options: ["서당", "금강전도", "인왕제색도", "송하맹호도"],
    answer: "서당",
    difficulty: "easy",
    topic: "김홍도",
  },
  {
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
  {
    id: "7",
    question:
      "다음 중 김홍도와 동시대 혹은 관련 화가로 묶기 ‘가장’ 어려운 인물은?",
    options: ["신윤복", "정선", "안견", "김득신"],
    answer: "안견",
    difficulty: "medium",
    topic: "김홍도",
  },
];

// ──────────────────────────────────────────────────────────────
// 2) 유틸
// ──────────────────────────────────────────────────────────────
function isHexColor(v: string) {
  return /^#([0-9a-fA-F]{6})$/.test(v);
}
function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}
function hexToRgba(hex: string, alpha = 1) {
  if (!isHexColor(hex)) return `rgba(239,68,68,${clamp01(alpha)})`; // fallback: red-500
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${clamp01(alpha)})`;
}
function toBase64Unicode(obj: unknown) {
  // UTF-8 안전 인코딩
  const s = JSON.stringify(obj);
  return typeof window === "undefined"
    ? Buffer.from(s, "utf-8").toString("base64")
    : btoa(unescape(encodeURIComponent(s)));
}
async function copyToClipboard(text: string) {
  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────────────────────────
// 3) 페이지
// ──────────────────────────────────────────────────────────────
export default function QrListPage() {
  const [origin, setOrigin] = useState("");
  const [rows, setRows] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const router = useRouter();

  const rainbow = useMemo(
    () => [
      { label: "빨", value: "#ef4444" },
      { label: "주", value: "#f97316" },
      { label: "노", value: "#eab308" },
      { label: "초", value: "#16a34a" },
      { label: "파", value: "#2563eb" },
      { label: "남", value: "#4f46e5" },
      { label: "보", value: "#7c3aed" },
    ],
    []
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
      const saved = localStorage.getItem(LS_COLOR_KEY);
      if (saved && isHexColor(saved)) setColor(saved);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const qsUserId =
          typeof router.query.user_id === "string"
            ? router.query.user_id
            : null;
        const userId =
          qsUserId ??
          (typeof window !== "undefined"
            ? localStorage.getItem("user_id")
            : null);

        if (qsUserId && typeof window !== "undefined") {
          localStorage.setItem("user_id", qsUserId);
        }

        // ① 서버에 저장된 문제 우선
        let normalized: Question[] = [];
        if (userId) {
          const res = await fetch("/api/ai-quiz-walk/quiz/list", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId }),
          });
          const j = await res.json().catch(() => ({}));
          if (res.ok && Array.isArray(j.items)) {
            normalized = j.items.map((it: any) => {
              const q = it?.question ?? it;
              const options = Array.isArray(q?.options)
                ? q.options
                : (() => {
                    try {
                      return JSON.parse(q?.options ?? "[]");
                    } catch {
                      return [];
                    }
                  })();
              return {
                id: String(q?.id ?? ""),
                topic: q?.topic ?? "",
                difficulty: q?.difficulty ?? "medium",
                question: q?.question ?? "",
                options,
                answer: q?.answer ?? "",
              } as Question;
            });
          } else {
            console.error("QR list load failed:", j?.error || j);
          }
        }

        // ② 비어있으면 김홍도 세트로 폴백
        if (!normalized.length) {
          normalized = KIMHONGDO_ITEMS;
        }

        setRows(normalized);
      } catch (e) {
        console.error(e);
        // 에러여도 김홍도 세트로 폴백
        setRows(KIMHONGDO_ITEMS);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const userTeamName =
    typeof window !== "undefined"
      ? localStorage.getItem("userTeamName") ?? ""
      : "";

  const onPick = (v: string) => {
    if (!isHexColor(v)) return;
    setColor(v);
    localStorage.setItem(LS_COLOR_KEY, v);
  };

  if (loading) return <main className="p-6">로딩 중…</main>;
  if (!rows.length) return <main className="p-6">저장된 문제가 없습니다.</main>;

  // 배경은 은은하게(인쇄 가독성 고려)
  const cardBg = hexToRgba(color, 0.1);
  const borderColor = hexToRgba(color, 0.5);
  const teamColor = color;

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <header className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              QR 목록
            </h1>
            {userTeamName && (
              <p className="text-sm font-medium">
                Team: <span style={{ color: teamColor }}>{userTeamName}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">색상</span>
            <div className="flex items-center gap-1.5">
              {rainbow.map((c) => (
                <button
                  key={c.value}
                  onClick={() => onPick(c.value)}
                  title={c.label}
                  aria-label={`${c.label} 선택`}
                  className="h-5 w-5 rounded-full border border-slate-300"
                  style={{
                    backgroundColor: c.value,
                    outline:
                      color === c.value ? `2px solid ${c.value}` : "none",
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => window.print()}
              className="ml-3 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm hover:bg-slate-50"
            >
              전체 인쇄
            </button>
            <button
              onClick={() => router.push("/escape-room/questioning")}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm hover:bg-slate-50"
            >
              홈으로
            </button>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2">
        {rows.map((s, i) => {
          // ─────────────────────────────────────────────
          // 서버/DB가 없어도 동작하도록 payload 삽입
          // 상세 페이지는 ?payload 가 있으면 이를 우선 사용
          // ─────────────────────────────────────────────
          const payload = encodeURIComponent(toBase64Unicode(s));
          const url = `${origin}/ai-quiz-walk/indoor/quiz/qr/${s.id}?payload=${payload}`;

          return (
            <article
              key={s.id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
              style={{
                background: cardBg,
                borderColor: borderColor,
                lineHeight: 2,
              }}
            >
              <p className="text-lg" style={{ color: teamColor }}>
                {userTeamName}
              </p>
              <p className="text-sm text-slate-500">{i + 1}번 문제</p>
              <h2 className="text-xl font-semibold leading-5 mt-1 tracking-wide leading-relaxed flex-wrap">
                {s.question}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                주제: {s.topic} · 난이도: {s.difficulty}
              </p>

              <div
                className="mt-3 mx-auto w-[270px] h-[270px] border rounded-xl p-2 bg-white"
                style={{ borderColor: borderColor }}
              >
                <QRCode
                  value={url}
                  size={250}
                  style={{ width: 250, height: 250 }}
                />
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  onClick={async () => {
                    const ok = await copyToClipboard(url);
                    if (!ok) {
                      alert(
                        "복사에 실패했습니다. 브라우저 설정을 확인하거나 수동으로 복사해주세요."
                      );
                    }
                  }}
                  className="rounded-lg px-3 py-1.5 text-xs hover:bg-slate-50 bg-white border"
                  style={{ borderColor: borderColor }}
                >
                  링크 복사
                </button>

                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg px-3 py-1.5 text-xs hover:bg-slate-50 bg-white border"
                  style={{ borderColor: borderColor }}
                >
                  새 창에서 열기
                </a>
              </div>
            </article>
          );
        })}
      </section>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }
          header {
            display: none !important;
          }
          article {
            break-inside: avoid;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </main>
  );
}
