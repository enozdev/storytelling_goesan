// // pages/ai-quiz-walk/indoor/quiz/q/[id].tsx
// "use client";

// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";

// type PublicQuestion = {
//   topic: string;
//   difficulty: string;
//   q: string;
//   options: string[];
//   a: string;
//   id: number;
// };

// export default function PublicQuizPage() {
//   const router = useRouter();
//   const { id } = router.query;

//   const [data, setData] = useState<PublicQuestion | null>(null);
//   const [my, setMy] = useState("");
//   const [reveal, setReveal] = useState(false);
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     if (!router.isReady || typeof id !== "string") return;
//     (async () => {
//       const r = await fetch(`/api/ai-quiz-walk/quiz/by-id/${id}`);
//       if (!r.ok) {
//         setErr((await r.json().catch(() => ({})))?.error ?? "불러오기 실패");
//         return;
//       }
//       const j = await r.json();
//       setData({ ...j, options: Array.isArray(j.options) ? j.options : [] });
//     })();
//   }, [router.isReady, id]);

//   if (err) return <main className="p-6">{err}</main>;
//   if (!data) return <main className="p-6">불러오는 중…</main>;

//   return (
//     <main className="mx-auto max-w-3xl px-5 py-8">
//       <header className="mb-4">
//         <h1 className="text-xl font-bold">
//           산막이 옛길 · 공개 문제 #{data.id}
//         </h1>
//         <p className="text-slate-600">
//           주제: {data.topic} · 난이도: {data.difficulty}
//         </p>
//       </header>

//       <div className="rounded-2xl border p-6 bg-white">
//         <p className="font-medium mb-4">{data.q}</p>
//         <ul className="space-y-2 mb-4">
//           {data.options.map((opt, i) => (
//             <li key={i}>
//               <label className="inline-flex items-center gap-2">
//                 <input
//                   type="radio"
//                   name="mc"
//                   value={opt}
//                   checked={my === opt}
//                   onChange={(e) => setMy(e.target.value)}
//                 />
//                 <span>{opt}</span>
//               </label>
//             </li>
//           ))}
//         </ul>

//         {!reveal ? (
//           <button
//             disabled={!my}
//             onClick={() => setReveal(true)}
//             className={`rounded-xl px-4 py-3 font-semibold ${
//               !my ? "bg-slate-200 text-slate-500" : "bg-emerald-600 text-white"
//             }`}
//           >
//             제출하고 정답 확인
//           </button>
//         ) : (
//           <div className="mt-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
//             <p className="text-emerald-800">
//               정답: <span className="font-semibold">{data.a}</span>
//             </p>
//             <p className="text-slate-600 mt-1">내 답안: {my || "(미입력)"}</p>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }
