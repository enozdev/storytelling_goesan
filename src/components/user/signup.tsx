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
  const [selectedGroup, setSelectedGroup] = useState("");
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);

  useEffect(() => {
    handleGroupList();
  }, []);

  const handleGroupList = async () => {
    const response = await fetch("/api/common/group/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      const data = await response.json();
      setGroupList(data.group);
    } else {
      alert("학교 목록을 불러오는 데 실패했습니다.");
    }
  };

  const handleUserSignup = async () => {
    const response = await fetch("/api/auth/user/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userTeamName,
        userTeamPassword,
        group: selectedGroup,
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
    <div className="h-screen bg-gradient-to-b from-green-100 to-white flex flex-col justify-center items-center px-6 text-gray-800">
      {isSignupSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
            <h2 className="text-xl font-semibold text-green-600 mb-4">
              팀 등록 완료!
            </h2>
            <p className="text-gray-700 mb-6">로그인 페이지로 이동합니다.</p>
            <button
              onClick={() => router.push("/ai-quiz-walk/user/login")}
              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
            >
              확인
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-1 text-green-700">
            <h1 className="text-3xl font-bold">팀 등록하기</h1>
          </div>
        </div>

        <div className="space-y-4">
          <select
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
            defaultValue=""
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="" disabled>
              학교를 선택해 주세요.
            </option>
            {groupList.map((group) => (
              <option key={group.idx} value={group.school}>
                {group.school}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="팀 이름"
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
            onChange={(e) => setUserTeamName(e.target.value)}
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
            onChange={(e) => setUserTeamPassword(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <button
            onClick={handleUserSignup}
            className="w-full py-3 bg-green-600 text-white rounded-lg text-base font-semibold hover:bg-green-700 transition"
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

          {/* <button 
            onClick={() => router.push("/ai-quiz-walk")}
            className="w-full py-3 border-2 border-gray-300 bg-gray-50 text-gray-700 rounded-lg text-base font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition"
          >
            <HomeIcon className="w-5 h-5" />
            홈으로
          </button> */}

          <button
            onClick={() => router.push("/ai-quiz-walk/admin/login")}
            className="w-full py-3 border-2 border-gray-300 bg-gray-50 text-gray-700 rounded-lg text-base font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition"
          >
            <LockClosedIcon className="w-5 h-5" />
            관리자 로그인
          </button>
        </div>
      </div>
    </div>
  );
}
