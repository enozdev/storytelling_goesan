import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import QuizForm from "@/components/ai-quiz-walk/quiz/QuizForm";
import QuizSet from "@/components/ai-quiz-walk/quiz/QuizSet";
import LatestQuizList from "@/components/ai-quiz-walk/quiz/LatestQuizSet";

// localStorage 48시간 만료 함수 => localStorage에는 chatpgt 대화기록 존재
const setWithExpiry = (key: string, value: any, expiryInHours: number = 1) => {
  const item = {
    value,
    expiry: new Date().getTime() + expiryInHours * 60 * 60 * 1000,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

const getWithExpiry = (key: string) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  if (new Date().getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
};

interface Quiz {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  questionOrder: number;
  qrCode: string;
}

interface QuizSet {
  id: number;
  title: string;
  topic: string;
  quizzes: Quiz[];
  createdAt: string;
}

export default function Quiz() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [latestQuizSet, setLatestQuizSet] = useState<QuizSet | null>(null);
  const [topic, setTopic] = useState("");
  const [teamName, setTeamName] = useState("");
  const [userTeamName, setUserTeamName] = useState<string>("팀 이름 없음");

  useEffect(() => {
    const storedTeamName =
      localStorage.getItem("userTeamName") || "팀 이름 없음";
    setUserTeamName(storedTeamName);
  }, []);

  const generateQuizzes = async (inputTopic: string) => {
    try {
      setError("");
      setIsLoading(true);
      setTopic(inputTopic);

      if (!inputTopic.trim()) {
        setError("주제를 입력해주세요.");
        setIsLoading(false);
        return;
      }

      const conversationHistory = getWithExpiry("geminiConversation") || [];

      const response = await fetch("/api/ai-quiz-walk/quiz-set/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputTopic,
          // conversationHistory,
        }),
      });

      const userTeamName =
        localStorage.getItem("userTeamName") || "팀 이름 없음";

      if (!response.ok) {
        throw new Error("퀴즈 생성 실패");
      }

      const data = await response.json();

      if (data.conversationHistory) {
        setWithExpiry("geminiConversation", data.conversationHistory, 144);
      }

      if (!data.quizzes || !Array.isArray(data.quizzes)) {
        throw new Error("퀴즈 데이터 형식이 올바르지 않습니다.");
      }

      console.log(data.quizzes);

      const convertedQuizzes = data.quizzes.map((quiz: any) => ({
        id: quiz.id,
        question: quiz.question,
        optionA: quiz.options.A,
        optionB: quiz.options.B,
        optionC: quiz.options.C,
        optionD: quiz.options.D,
        answer: quiz.answer,
        questionOrder: quiz.questionOrder,
        qrCode: quiz.qrCode,
      }));

      setQuizzes(convertedQuizzes);
    } catch (err) {
      console.error("퀴즈 생성 에러:", err);
      setError(
        err instanceof Error ? err.message : "퀴즈 생성 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10 flex flex-col justify-between items-center">
      {/* 상단 영역 */}
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-3xl font-bold text-green-700 mb-3">
          괴산 AI 문제 생성기
        </h1>
        <p className="text-md text-gray-600 text-center mb-8">
          만들고 싶은 퀴즈의 내용을 자유롭게 작성해보세요.
        </p>
        <div style={{ marginBottom: 20 }}>
          <div className="text-2xl mb-4 items-center flex flex-col">
            {userTeamName}
          </div>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="예: 괴산의 역사, 괴산의 특산물"
            style={{ width: "100%", padding: "10px 10px", fontSize: 16 }}
            disabled={isLoading}
            className="border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{ marginTop: 10, padding: "10px 20px" }}
            className="w-full py-3 bg-green-600 text-white rounded-lg text-base font-semibold hover:bg-green-700 transition"
          >
            {isLoading ? "생성중..." : "AI로 문제 생성하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
