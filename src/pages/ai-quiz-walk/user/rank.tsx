import { useRouter } from "next/router";
import { UsersIcon, TrophyIcon, HomeIcon } from "@heroicons/react/24/solid";

export default function Rank() {
  const router = useRouter();

  const teamRanks = [
    { team: "초코칩팀", score: 124 },
    { team: "번개팀", score: 112 },
    { team: "무지개팀", score: 105 },
    { team: "꼬마별팀", score: 98 },
    { team: "솜사탕팀", score: 91 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-orange-50 to-white py-8 px-4 flex flex-col justify-between">
      <div className="max-w-md mx-auto w-full text-center">
        <div className="flex justify-center items-center gap-2 text-yellow-600 mb-4">
          <TrophyIcon className="w-8 h-8" />
          <h1 className="text-3xl font-bold">🥇 팀 랭킹 🥇</h1>
        </div>
        <p className="text-gray-600 mb-6 text-sm">
          어떤 팀이 가장 많은 문제를 맞췄을까요?
        </p>

        <ul className="space-y-3">
          {teamRanks.map((team, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between bg-white rounded-xl shadow p-3 px-5 border-l-4 border-yellow-400"
            >
              <div className="flex items-center gap-3 text-lg font-semibold">
                <UsersIcon className="w-6 h-6 text-yellow-500" />
                <span>
                  {idx + 1}위. {team.team}
                </span>
              </div>
              <span className="text-yellow-700 font-bold">{team.score}점</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 하단 홈 버튼 */}
      <div className="mt-10 w-full max-w-md mx-auto">
        <button
          onClick={() => router.push("/ai-quiz-walk")}
          className="w-full py-3 bg-yellow-500 text-white rounded-xl text-lg font-bold shadow hover:bg-yellow-600 transition flex items-center justify-center gap-2"
        >
          <HomeIcon className="w-6 h-6" />
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
