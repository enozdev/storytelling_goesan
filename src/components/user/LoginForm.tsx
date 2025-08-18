// src/components/user/LoginForm.tsx
import { useState } from "react";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";

type Props = {
  onUserLogin: (payload: {
    userTeamName: string;
    userTeamPassword: string;
  }) => Promise<void> | void;
  onAdminLogin: (payload: {
    userTeamName: string;
    userTeamPassword: string;
  }) => Promise<void> | void;
  isLoading?: boolean;
};

export default function LoginForm({
  onUserLogin,
  onAdminLogin,
  isLoading,
}: Props) {
  const [userTeamName, setUserTeamName] = useState("");
  const [userTeamPassword, setUserTeamPassword] = useState("");
  const router = useRouter();

  const handleUser = async () => {
    await onUserLogin({ userTeamName, userTeamPassword });
  };

  const handleAdmin = async () => {
    await onAdminLogin({ userTeamName, userTeamPassword });
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 to-green-50 flex flex-col justify-center items-center px-6 text-green-900">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-1 text-green-700">
            <h1 className="text-3xl font-bold">로그인</h1>
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="팀 이름"
            className="w-full py-3 px-4 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
            value={userTeamName}
            onChange={(e) => setUserTeamName(e.target.value)}
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full py-3 px-4 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
            value={userTeamPassword}
            onChange={(e) => setUserTeamPassword(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <button
            onClick={handleUser}
            disabled={isLoading}
            className="w-full py-3 bg-green-600 text-white rounded-lg text-base font-semibold hover:bg-green-700 transition disabled:opacity-60"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>

          <button
            onClick={() => router.push("/ai-quiz-walk/user/signup")}
            className="w-full py-3 border-2 border-gray-100 bg-gray-100 text-green-700 rounded-lg font-semibold shadow hover:bg-green-100 transition"
          >
            팀 등록하기
          </button>

          <button
            onClick={handleAdmin}
            disabled={isLoading}
            className="w-full py-3 border-2 border-green-300 bg-green-50 text-green-700 rounded-lg font-semibold shadow hover:bg-green-100 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <LockClosedIcon className="w-5 h-5" />
            {isLoading ? "관리자 로그인 중..." : "관리자 로그인"}
          </button>
        </div>
      </div>
    </div>
  );
}
