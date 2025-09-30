// src/components/user/LoginForm.tsx
import { useState } from "react";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";

type Props = {
  onUserLogin: (payload: {
    userTeamName: string;
    userTeamPassword: string;
    role: string;
  }) => Promise<void> | void;
  isLoading?: boolean;
};

export default function LoginForm({ onUserLogin, isLoading = false }: Props) {
  const [userTeamName, setUserTeamName] = useState("");
  const [userTeamPassword, setUserTeamPassword] = useState("");
  const [role, setRole] = useState("");
  const router = useRouter();

  const handleUser = async () => {
    if (!userTeamName.trim() || !userTeamPassword.trim()) {
      alert("팀 이름과 비밀번호를 모두 입력해주세요.");
      return;
    }
    await onUserLogin({ userTeamName, userTeamPassword, role });
  };

  return (
    <div className="h-screen bg-[#F6F1E7] flex flex-col justify-center items-center px-6 text-[#3F3629]">
      <div className="w-full max-w-md bg-white/90 border border-[#E9E2D3] rounded-2xl shadow-[0_10px_30px_-18px_rgba(0,0,0,.25)] p-8 space-y-8 backdrop-blur-sm">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-2 text-[#3F3629]">
            <LockClosedIcon className="w-7 h-7 text-[#A98D5F]" />
            <h1 className="text-3xl font-bold">로그인</h1>
          </div>
          <p className="text-sm text-[#6B604E]">
            팀 이름과 비밀번호를 입력하세요
          </p>
          <div className="mx-auto w-16 h-[2px] bg-[#3F3629]/20" />
        </div>

        {/* 입력 필드 */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="팀 이름"
            className="w-full py-3 px-4 border border-[#E9E2D3] rounded-xl bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#BFA06A] text-base"
            value={userTeamName}
            onChange={(e) => setUserTeamName(e.target.value)}
            disabled={isLoading} // 로딩 중 입력도 잠깐 막을 수 있음
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full py-3 px-4 border border-[#E9E2D3] rounded-xl bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#BFA06A] text-base"
            value={userTeamPassword}
            onChange={(e) => setUserTeamPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* 버튼 */}
        <div className="space-y-3">
          <button
            onClick={handleUser}
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-semibold text-base shadow-md transition
              ${
                isLoading
                  ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                  : "bg-gradient-to-br from-[#3F3629] to-[#2F291F] text-[#F6F1E7] hover:brightness-[1.05]"
              }`}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>

          <button
            onClick={() => router.push("/escape-room/user/signup")}
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-semibold text-base shadow border border-[#E9E2D3] 
                       bg-white hover:bg-[#FAF7F0] text-[#3F3629] transition disabled:opacity-60"
          >
            팀 등록하기
          </button>
        </div>
      </div>
    </div>
  );
}
