import { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface Quiz {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  questionOrder: number;
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
  const [topic, setTopic] = useState("");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [latestQuizSet, setLatestQuizSet] = useState<QuizSet | null>(null);

  useEffect(() => {
    const fetchLatestQuiz = async () => {
      // 퀴즈 최신 목록 불러오기
      try {
        const response = await fetch("/api/latestQuiz");
        if (!response.ok) {
          throw new Error("퀴즈를 불러오는데 실패했습니다.");
        }
        const data = await response.json();
        setLatestQuizSet(data);
      } catch (err) {
        console.error("퀴즈 로딩 에러:", err);
      }
    };

    fetchLatestQuiz();
  }, []);

  // Gemini API로 퀴즈 생성
  const generateQuizzes = async () => {
    try {
      setError("");
      setIsLoading(true);

      if (!topic.trim()) {
        setError("주제를 입력해주세요.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/api_quizzes", {
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

      if (!data.quizzes || !Array.isArray(data.quizzes)) {
        throw new Error("퀴즈 데이터 형식이 올바르지 않습니다.");
      }

      // Gemini API 응답을 DB에 저장하도록 형식 변환
      const convertedQuizzes = data.quizzes.map((quiz: any) => ({
        id: quiz.id,
        question: quiz.question,
        optionA: quiz.options.A,
        optionB: quiz.options.B,
        optionC: quiz.options.C,
        optionD: quiz.options.D,
        answer: quiz.answer,
        questionOrder: quiz.questionOrder,
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

  const handleSubmit = async () => {
    try {
      setError("");
      setIsLoading(true);

      if (!topic.trim()) {
        setError("주제를 입력해주세요.");
        setIsLoading(false);
        return;
      }

      if (quizzes.length === 0) {
        setError(
          "생성된 퀴즈가 없습니다. 'AI로 문제 생성하기' 버튼을 클릭해주세요."
        );
        setIsLoading(false);
        return;
      }

      // 1. QuizSet 생성
      const quizSetRes = await fetch("/api/quizSet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${topic} 퀴즈 세트`,
          topic: topic,
        }),
      });

      if (!quizSetRes.ok) {
        throw new Error("퀴즈 세트 생성 실패");
      }

      const quizSet = await quizSetRes.json();

      // 2. 각 퀴즈 생성
      const quizPromises = quizzes.map(async (quiz, index) => {
        const quizRes = await fetch("/api/quiz", {
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
            qrCode: `/quiz/my_quiz/${quiz.id}`,
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
      setTopic("");

      // 최신 퀴즈 목록 새로고침
      const latestResponse = await fetch("/api/latestQuiz");
      if (!latestResponse.ok) {
        throw new Error("최신 퀴즈를 불러오는데 실패했습니다.");
      }
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

  const handleViewLatestQuiz = () => {
    router.push("/quiz/latest");
  };

  return (
    <div style={{ padding: 20, width: "40%", margin: "0 auto" }}>
      <h1>괴산 문제 생성기</h1>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="예: 괴산의 역사, 괴산의 특산물"
        style={{ width: "100%", padding: 10, fontSize: 16 }}
      />
      <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
        <button onClick={generateQuizzes} disabled={isLoading}>
          {isLoading ? "생성중..." : "AI로 문제 생성하기"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading || quizzes.length === 0}
        >
          문제 저장하기
        </button>
      </div>

      {error && <div style={{ color: "red" }}>{error}</div>}

      {quizzes.map((quiz, index) => (
        <div
          key={index}
          style={{ marginTop: 20, padding: 15, border: "1px solid #ddd" }}
        >
          <h3>문제 {index + 1}</h3>
          <p>
            <strong>질문:</strong> {quiz.question}
          </p>
          <div>
            <strong>보기:</strong>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li>A. {quiz.optionA}</li>
              <li>B. {quiz.optionB}</li>
              <li>C. {quiz.optionC}</li>
              <li>D. {quiz.optionD}</li>
            </ul>
          </div>
          <p>
            <strong>정답:</strong> {quiz.answer}
          </p>
        </div>
      ))}

      {latestQuizSet && (
        <div
          style={{ marginTop: 40, borderTop: "2px solid #ddd", paddingTop: 20 }}
        >
          <h2>최근 저장된 퀴즈</h2>
          <h3>{latestQuizSet.title}</h3>
          <p>주제: {latestQuizSet.topic}</p>
          <p>생성일: {new Date(latestQuizSet.createdAt).toLocaleString()}</p>

          {latestQuizSet.quizzes.map((quiz) => (
            <div
              key={quiz.id}
              style={{ marginTop: 20, padding: 15, border: "1px solid #ddd" }}
            >
              <h3>문제 {quiz.questionOrder}</h3>
              <p>
                <strong>질문:</strong> {quiz.question}
              </p>
              <div>
                <strong>보기:</strong>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  <li>A. {quiz.optionA}</li>
                  <li>B. {quiz.optionB}</li>
                  <li>C. {quiz.optionC}</li>
                  <li>D. {quiz.optionD}</li>
                </ul>
              </div>
              <p>
                <strong>정답:</strong> {quiz.answer}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
