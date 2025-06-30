import { QRCodeSVG } from "qrcode.react";

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

interface QuizListProps {
  quizzes: Quiz[];
  isLoading: boolean;
}

export default function QuizSet({ quizzes, isLoading }: QuizListProps) {
  return (
    <div>
      {quizzes.length > 0 && (
        <button
          disabled={isLoading}
          style={{ marginTop: 20, padding: "10px 20px" }}
        >
          {isLoading ? "저장중..." : "문제 저장하기"}
        </button>
      )}

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
    </div>
  );
}
