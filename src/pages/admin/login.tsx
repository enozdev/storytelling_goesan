import { useState } from "react";
import { useRouter } from "next/router";
import { LockClosedIcon, HomeIcon } from "@heroicons/react/24/solid";

export default function Login() {
  const router = useRouter();
  const [adminID, setAdminID] = useState("");
  const [adminPWD, setAdminPWD] = useState("");

  const handleLogin = async () => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminID, adminPWD }),
    });

    if (response.ok) {
      router.push("/quiz/quizList");
    } else {
      alert("로그인 실패");
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-100 to-white flex flex-col justify-center items-center px-6 text-gray-800">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-1 text-green-700">
            <LockClosedIcon className="w-6 h-6" />
            <h1 className="text-2xl font-bold">관리자 로그인</h1>
          </div>
          <p className="text-sm text-gray-500">관리자만 접속할 수 있어요</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="아이디"
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
            onChange={(e) => setAdminID(e.target.value)}
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
            onChange={(e) => setAdminPWD(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-green-600 text-white rounded-lg text-base font-semibold hover:bg-green-700 transition"
          >
            로그인
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 border border-gray-300 bg-gray-50 text-gray-700 rounded-lg text-base font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition"
          >
            <HomeIcon className="w-5 h-5" />
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}
