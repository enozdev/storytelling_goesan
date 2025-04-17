import { Quiz, QuizSet } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QuizSetWithQuizzes extends QuizSet {
  quizzes: Quiz[];
}

const QuizList = () => {
  const [quizList, setQuizList] = useState<QuizSetWithQuizzes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedQuizSets, setExpandedQuizSets] = useState<number[]>([]);

  useEffect(() => {
    const fetchQuizSets = async () => {
      try {
        const response = await fetch("/api/getAllQuizzes");
        if (!response.ok) {
          throw new Error("퀴즈 세트를 불러오는데 실패했습니다.");
        }
        const data = await response.json();
        setQuizList(data);
      } catch (err) {
        console.error("퀴즈 세트 로딩 에러:", err);
        setError(
          err instanceof Error
            ? err.message
            : "퀴즈 세트를 불러오는데 실패했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuizSets();
  }, []);

  const toggleQuizSet = (quizSetId: number) => {
    setExpandedQuizSets((prev) =>
      prev.includes(quizSetId)
        ? prev.filter((id) => id !== quizSetId)
        : [...prev, quizSetId]
    );
  };

  if (isLoading) {
    return <div style={{ padding: 20, textAlign: "center" }}>로딩중...</div>;
  }

  if (error) {
    return <div style={{ padding: 20, color: "red" }}>{error}</div>;
  }

  return (
    <div style={{ padding: 20, width: "40%", margin: "0 auto" }}>
      <h1>퀴즈 세트 목록</h1>
      {quizList.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          퀴즈 세트가 없습니다.
        </div>
      ) : (
        quizList.map((quizSet) => (
          <div
            key={quizSet.id}
            style={{
              marginTop: 20,
              padding: 15,
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
          >
            <div
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onClick={() => toggleQuizSet(quizSet.id)}
            >
              <div>
                <h2>{quizSet.title}</h2>
                <p>
                  <strong>주제:</strong> {quizSet.topic}
                </p>
                <p>
                  <strong>생성일:</strong>{" "}
                  {new Date(quizSet.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>생성자:</strong> {quizSet.createdBy}
                </p>
              </div>
              <div>
                <span style={{ fontSize: "1.2em" }}>
                  {expandedQuizSets.includes(quizSet.id) ? "▼" : "▶"}
                </span>
              </div>
            </div>

            {expandedQuizSets.includes(quizSet.id) && (
              <div style={{ marginTop: 10 }}>
                <h3>문제 목록 ({quizSet.quizzes.length}개)</h3>
                {quizSet.quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    style={{
                      marginTop: 10,
                      padding: 10,
                      border: "1px solid #eee",
                      borderRadius: "3px",
                    }}
                  >
                    <p>
                      <strong>문제 {quiz.questionOrder}:</strong>{" "}
                      {quiz.question}
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
                    <p>
                      <strong>QR 코드:</strong>
                    </p>
                    <p style={{ textAlign: "center" }}>
                      <QRCodeSVG value={quiz.qrCode} />
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default QuizList;
