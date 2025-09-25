import { useState } from "react";
import { useRouter } from "next/router";
import {
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";

export default function UserSignup() {
  const router = useRouter();
  const [userTeamName, setUserTeamName] = useState("");
  const [userTeamPassword, setUserTeamPassword] = useState("");
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);

  const handleUserSignup = async () => {
    const response = await fetch("/api/auth/user/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userTeamName,
        userTeamPassword,
      }),
    });

    if (response.ok) {
      setIsSignupSuccess(true);
      setTimeout(() => router.push("/ai-quiz-walk/user/login"), 1500);
    } else {
      if (response.status === 409) {
        alert("이미 존재하는 팀 이름입니다. 다른 이름을 사용해 주세요.");
      } else {
        alert("회원가입 실패");
      }
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-[#2F291F] to-[#1F1A14] flex flex-col justify-center items-center px-6 text-[#EDE8DF]">
      {isSignupSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-80 text-center">
            <h2 className="text-xl font-semibold text-[#3F3629] mb-4">
              팀 등록 완료!
            </h2>
            <p className="text-[#5d5342] mb-6">로그인 페이지로 이동합니다.</p>
            <button
              onClick={() => router.push("/ai-quiz-walk/user/login")}
              className="w-full py-2 bg-[#3F3629] text-[#F6F1E7] rounded-lg font-semibold hover:bg-[#2F291F] transition"
            >
              확인
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-[#F9F7F3] border border-[#E5DED0] rounded-2xl shadow-xl p-8 space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-2 text-[#A98D5F]">
            <UserPlusIcon className="w-7 h-7" />
            <h1 className="text-3xl font-bold text-[#3F3629]">팀 등록하기</h1>
          </div>
          <p className="text-sm text-[#6B604E]">
            새로운 팀을 생성하고 방탈출에 참여하세요
          </p>
          <div className="mx-auto w-16 h-[2px] bg-[#DCC9A3]/60" />
        </div>

        {/* 입력 필드 (화이트 톤) */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="팀 이름"
            className="w-full py-3 px-4 rounded-xl bg-white border border-[#E5DED0] text-[#3F3629] placeholder:text-[#9C8F7A] focus:outline-none focus:ring-2 focus:ring-[#BFA06A]"
            onChange={(e) => setUserTeamName(e.target.value)}
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full py-3 px-4 rounded-xl bg-white border border-[#E5DED0] text-[#3F3629] placeholder:text-[#9C8F7A] focus:outline-none focus:ring-2 focus:ring-[#BFA06A]"
            onChange={(e) => setUserTeamPassword(e.target.value)}
          />
        </div>

        {/* 버튼 */}
        <div className="space-y-3">
          <button
            onClick={handleUserSignup}
            className="w-full py-3 bg-gradient-to-br from-[#BFA06A] to-[#A98D5F] text-[#2F291F] rounded-xl font-semibold shadow-md hover:brightness-110 transition"
          >
            등록하기
          </button>

          <div className="flex items-center justify-between text-sm text-[#6B604E]">
            <span>이미 팀이 있으신가요?</span>
          </div>

          <button
            onClick={() => router.push("/escape-room/user/login")}
            className="w-full py-3 rounded-xl font-semibold text-base shadow border border-[#E5DED0] 
                       bg-white text-[#3F3629] hover:bg-[#FAF7F0] transition flex items-center justify-center gap-2"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />팀 로그인
          </button>
        </div>
      </div>
    </div>
  );
}
