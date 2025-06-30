import { useRouter } from "next/router";
import { HomeIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

export default function Quiz() {
  const router = useRouter();
  const [topic, setTopic] = useState("");

  const generateQuizzes = async () => {
    try {
      const response = await fetch("/api/ai-quiz-walk/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: topic,
        }),
      });

      if (!response.ok) {
        throw new Error("퀴즈 생성 실패");
      }

      const data = await response.json();
    } catch (err) {
      console.error("퀴즈 생성 에러:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10 flex flex-col justify-between items-center">
      {/* 상단 영역 */}
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-3xl font-bold text-green-700 mb-3">
          괴산 문제 생성기
        </h1>

        <p className="text-md text-gray-600 text-center mb-8">
          만들고 싶은 퀴즈의 내용을 아래에 자유롭게 작성해보세요.
        </p>

        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="예: 괴산의 명소를 주제로 한 퀴즈를 만들어줘"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* 하단 버튼 영역 */}
      <div className="w-full max-w-md mt-12 mb-4 flex flex-col gap-4">
        <button
          onClick={async () => {
            await generateQuizzes();
            router.push({
              pathname: "/quiz/ai-created",
              query: { quiz: JSON.stringify(generateQuizzes) },
            });
          }}
          className="w-full py-3 bg-green-500 text-white rounded-xl text-lg font-semibold shadow hover:bg-green-600 transition"
        >
          AI로 문제 생성하기
        </button>

        <button
          onClick={() => router.push("/ai-quiz-walk")}
          className="w-full py-3 bg-gray-100 text-gray-800 rounded-xl text-lg font-semibold shadow hover:bg-gray-200 transition flex items-center justify-center gap-2"
        >
          <HomeIcon className="w-5 h-5 text-green-600" />
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
