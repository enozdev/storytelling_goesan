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

interface QuizSet {
  id: number;
  title: string;
  topic: string;
  quizzes: Quiz[];
  createdAt: string;
}

interface LatestQuizListProps {
  quizSet: QuizSet | null;
}

export default function LatestQuizList({ quizSet }: LatestQuizListProps) {
  if (!quizSet) return null;

  return (
    <div style={{ marginTop: 40, borderTop: "2px solid #ddd", paddingTop: 20 }}>
      <h2>최근 저장된 퀴즈</h2>
      <h3>{quizSet.title}</h3>
      <p>주제: {quizSet.topic}</p>
      <p>생성일: {new Date(quizSet.createdAt).toLocaleString()}</p>

      {quizSet.quizzes.map((quiz) => (
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
          <div>
            <div>
              <strong>QR 코드:</strong>
            </div>
            <div style={{ textAlign: "center" }}>
              <QRCodeSVG value={quiz.qrCode} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
