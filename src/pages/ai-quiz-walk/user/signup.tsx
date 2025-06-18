import { useState } from "react";
import { useRouter } from "next/router";
import { LockClosedIcon, HomeIcon } from "@heroicons/react/24/solid";

const schools = [
  { label: "목도초등학교", value: "목도초등학교" },
  { label: "송면초등학교", value: "송면초등학교" },
  { label: "청안초등학교", value: "청안초등학교" },
  { label: "청천초등학교", value: "청천초등학교" },
  { label: "백봉초등학교", value: "백봉초등학교" },
  { label: "연풍초등학교", value: "연풍초등학교" },
  { label: "감물초등학교", value: "감물초등학교" },
  { label: "칠성초등학교", value: "칠성초등학교" },
  { label: "괴산명덕초등학교", value: "괴산명덕초등학교" },
  { label: "동인초등학교", value: "동인초등학교" },
];

export default function Signup() {
  const router = useRouter();
  const [adminID, setAdminID] = useState("");
  const [adminPWD, setAdminPWD] = useState("");

  return (
    <div className="h-screen bg-gradient-to-b from-gray-100 to-white flex flex-col justify-center items-center px-6 text-gray-800">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-1 text-green-700">
            <h1 className="text-3xl font-bold">회원가입</h1>
          </div>
        </div>

        <div className="space-y-4">
          <select
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
            defaultValue=""
            onChange={(e) => {
              const school = e.target.value;
            }}
          >
            <option value="" disabled>
              학교를 선택해 주세요.
            </option>
            {schools.map((school) => (
              <option key={school.value} value={school.value}>
                {school.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="팀 이름"
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
            onClick={() => router.push("/ai-quiz-walk/user/signup")}
            className="w-full py-3 border-green-600 text-green-700 rounded-lg font-semibold shadow hover:bg-green-50 transition"
          >
            회원가입하기
          </button>

          <button
            onClick={() => router.push("/ai-quiz-walk")}
            className="w-full py-3 border-2 border-gray-300 bg-gray-50 text-gray-700 rounded-lg text-base font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition"
          >
            <HomeIcon className="w-5 h-5" />
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}
