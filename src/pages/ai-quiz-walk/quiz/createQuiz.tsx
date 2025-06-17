import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import QuizForm from "@/components/ai-quiz-walk/quiz/QuizForm";
import QuizList from "@/components/ai-quiz-walk/quiz/QuizSet";
import LatestQuizList from "@/components/ai-quiz-walk/quiz/LatestQuizSet";
import { HomeIcon } from "@heroicons/react/24/solid";

// localStorage 48시간 만료 함수
const setWithExpiry = (
  key: string,
  value: any,
  expiryInHours: number = 144
) => {
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

  // useEffect(() => {
  //   const fetchLatestQuiz = async () => {
  //     try {
  //       const response = await fetch("/api/quiz-set/last");
  //       if (!response.ok) {
  //         throw new Error("퀴즈를 불러오는데 실패했습니다.");
  //       }
  //       const data = await response.json();
  //       setLatestQuizSet(data);
  //     } catch (err) {
  //       console.error("퀴즈 로딩 에러:", err);
  //     }
  //   };

  //   fetchLatestQuiz();
  // }, []);

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

      const response = await fetch("/api/quiz-set/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputTopic,
          conversationHistory,
        }),
      });

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

  const saveQuizSet = async () => {
    try {
      setError("");
      setIsLoading(true);

      if (quizzes.length === 0) {
        setError(
          "생성된 퀴즈가 없습니다. 'AI로 문제 생성하기' 버튼을 클릭해주세요."
        );
        setIsLoading(false);
        return;
      }

      const quizSetRes = await fetch("/api/quiz-set/saveDB", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${topic} 퀴즈 세트`,
          topic: topic,
          teamName: teamName,
        }),
      });

      if (!quizSetRes.ok) {
        throw new Error("퀴즈 세트 생성 실패");
      }

      const quizSet = await quizSetRes.json();

      const quizPromises = quizzes.map(async (quiz, index) => {
        const quizRes = await fetch("/api/quiz/saveDB", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizSetId: quizSet.id,
            question: quiz.question,
            optionA: quiz.optionA,
            optionB: quiz.optionB,
            optionC: quiz.optionC,
            optionD: quiz.optionD,
            answer: quiz.answer,
            questionOrder: index + 1,
            qrCode: quiz.qrCode,
          }),
        });

        if (!quizRes.ok) {
          throw new Error("퀴즈 생성 실패");
        }

        return quizRes.json();
      });

      await Promise.all(quizPromises);

      alert("퀴즈가 성공적으로 저장되었습니다!");
      setQuizzes([]);

      const latestResponse = await fetch("/api/quiz-set/last");
      const latestData = await latestResponse.json();
      setLatestQuizSet(latestData);
    } catch (err) {
      console.error("저장 에러:", err);
      setError(
        err instanceof Error ? err.message : "퀴즈 저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-green-700 mb-4">
        괴산 문제 생성기
      </h1>

      <div className="w-full max-w-md space-y-6">
        <QuizForm
          onSubmit={generateQuizzes}
          isLoading={isLoading}
          teamName={teamName}
          onTeamNameChange={setTeamName}
        />

        {error && (
          <div className="text-red-500 text-sm font-medium">{error}</div>
        )}

        <QuizList
          quizzes={quizzes}
          onSave={saveQuizSet}
          isLoading={isLoading}
        />

        {quizzes.length === 0 && latestQuizSet && (
          <LatestQuizList quizSet={latestQuizSet} />
        )}
      </div>

      <div className="mt-10 w-full max-w-md mx-auto">
        <button
          onClick={() => router.push("/ai-quiz-walk")}
          className="w-full py-3 bg-yellow-500 text-white rounded-xl text-lg font-bold shadow hover:bg-yellow-600 transition flex items-center justify-center gap-2"
        >
          <HomeIcon className="w-6 h-6" />
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
