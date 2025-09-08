import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LockClosedIcon, HomeIcon } from "@heroicons/react/24/solid";

export default function UserSignup() {
  const router = useRouter();
  const [userTeamName, setUserTeamName] = useState("");
  const [userTeamPassword, setUserTeamPassword] = useState("");
  const [groupList, setGroupList] = useState<{ idx: number; school: string }[]>(
    []
  );
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
    } else {
      if (response.status === 409) {
        alert("이미 존재하는 팀 이름입니다. 다른 이름을 사용해 주세요.");
      } else {
        alert("회원가입 실패");
      }
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-cyan-100 to-white flex flex-col justify-center items-center px-6 text-gray-800">
      {isSignupSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
            <h2 className="text-xl font-semibold text-cyan-600 mb-4">
              팀 등록 완료!
            </h2>
            <p className="text-gray-700 mb-6">로그인 페이지로 이동합니다.</p>
            <button
              onClick={() => router.push("/ai-quiz-walk/user/login")}
              className="w-full bg-cyan-500 text-white py-2 rounded-lg hover:bg-cyan-600 transition"
            >
              확인
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-1 text-cyan-700">
            <h1 className="text-3xl font-bold">팀 등록하기</h1>
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="팀 이름"
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-base"
            onChange={(e) => setUserTeamName(e.target.value)}
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-base"
            onChange={(e) => setUserTeamPassword(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <button
            onClick={handleUserSignup}
            className="w-full py-3 bg-cyan-600 text-white rounded-lg text-base font-semibold hover:bg-cyan-700 transition"
          >
            등록하기
          </button>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>이미 팀이 있으신가요?</span>
          </div>

          <button
            onClick={() => router.push("/ai-quiz-walk/user/login")}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            팀 로그인
          </button>
        </div>
      </div>
    </div>
  );
}
