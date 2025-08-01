import { useState } from "react";
import { useRouter } from "next/router";
import { LockClosedIcon, HomeIcon } from "@heroicons/react/24/solid";

export default function UserLogin() {
  const router = useRouter();
  const [userTeamName, setUserTeamName] = useState("");
  const [userTeamPassword, setUserTeamPassword] = useState("");

  const handleUserLogin = async () => {
    const response = await fetch("/api/auth/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userTeamName, userTeamPassword }),
    });

    if (response.ok) {
      if (router.query.redirect) {
        router.push(router.query.redirect as string);
      } else {
        router.push("/ai-quiz-walk/quiz/create");
      }
    } else {
      alert("로그인 실패");
    }
  };

  const handleAdminLogin = async () => {
    const response = await fetch("/api/auth/adminLogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userTeamName,
        userTeamPassword,
      }),
    });
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 to-cyan-50 flex flex-col justify-center items-center px-6 text-cyan-900">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-1 text-cyan-700">
            <h1 className="text-3xl font-bold">로그인</h1>
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="팀 이름"
            className="w-full py-3 px-4 border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-base"
            onChange={(e) => setUserTeamName(e.target.value)}
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full py-3 px-4 border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-base"
            onChange={(e) => setUserTeamPassword(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <button
            onClick={handleUserLogin}
            className="w-full py-3 bg-cyan-600 text-white rounded-lg text-base font-semibold hover:bg-cyan-700 transition"
          >
            로그인
          </button>
          <button
            onClick={() => router.push("/ai-quiz-walk/user/signup")}
            className="w-full py-3 border-2 border-cyan-300 bg-cyan-50 text-cyan-700 rounded-lg font-semibold shadow hover:bg-cyan-100 transition"
          >
            팀 등록하기
          </button>
          <button
            onClick={handleAdminLogin}
            className="w-full py-3  border-cyan-600 text-cyan-700 rounded-lg text-base font-semibold flex items-center justify-center gap-2 hover:bg-cyan-50 transition"
          >
            <LockClosedIcon className="w-5 h-5" />
            관리자 로그인
          </button>
        </div>
      </div>
    </div>
  );
}
