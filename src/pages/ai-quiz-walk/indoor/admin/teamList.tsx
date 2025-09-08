// pages/ai-quiz-walk/indoor/admin/teamList.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

type TeamRow = { idx: string; userTeamName: string };

export default function AdminTeamListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<TeamRow[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/auth/user/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}), // 필요 없으면 제거 가능
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("load teams failed:", res.status, text);
          setRows([]);
          return;
        }

        const j: {
          success?: boolean;
          user?: Array<{ idx: number | string; userTeamName: string }>;
        } = await res.json();

        const items: TeamRow[] = Array.isArray(j.user)
          ? j.user.map((u) => ({
              idx: String(u.idx ?? ""),
              userTeamName: String(u.userTeamName ?? ""),
              count: 0, // 서버 응답에 count 없으므로 기본값
            }))
          : [];

        setRows(items);
      } catch (err) {
        console.error("load teams error:", err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const onSelect = (row: TeamRow) => {
    // QR 페이지에서 사용할 값 저장
    localStorage.setItem("user_id", row.idx);
    localStorage.setItem("userTeamName", row.userTeamName);
    // 쿼리로도 전달
    router.push(
      `/ai-quiz-walk/indoor/quiz/qr?user_id=${encodeURIComponent(row.idx)}`
    );
  };

  if (loading) return <main className="p-6">로딩 중…</main>;

  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <header className="mb-6 rounded-2xl border bg-white shadow-sm p-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            QR 인쇄 - 팀 목록
          </h1>
          <button
            onClick={() => router.push("/ai-quiz-walk")}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            홈으로
          </button>
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="px-5 text-slate-600">팀 정보가 없습니다.</p>
      ) : (
        <div>
          <p className="px-5 text-slate-600">
            버튼 클릭 시 인쇄 페이지로 이동합니다.
          </p>
          <section className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            <ul role="list" className="divide-y">
              {rows.map((r) => (
                <li key={r.idx} className="hover:bg-slate-50">
                  <button
                    onClick={() => onSelect(r)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {r.userTeamName || "(팀 미설정)"}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </main>
  );
}
