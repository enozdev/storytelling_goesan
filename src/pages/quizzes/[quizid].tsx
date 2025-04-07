import { useRouter } from 'next/router';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

interface Quiz {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: string;
}

export default function QuizDetail() {
  const router = useRouter();
  const { quizid } = router.query;
  const [question, setQuestion] = useState<Quiz | null>(null);

  useEffect(() => {
    const savedQuizzes = localStorage.getItem('quizQuestions');
    if (savedQuizzes) {
      const quizzes: Quiz[] = JSON.parse(savedQuizzes);
      const foundQuestion = quizzes.find((q) => q.id === Number(quizid));
      setQuestion(foundQuestion || null);
    }
  }, [quizid]);

  if (!question) {
    return <div>문제를 찾을 수 없습니다.</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>문제 {question.id}</h1>
      <div style={{ marginBottom: 20 }}>
        <h2>질문</h2>
        <p>{question.question}</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h2>보기</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {Object.entries(question.options).map(([key, value]) => (
            <li key={key} style={{ marginBottom: 10 }}>
              {key}. {value}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 30, textAlign: 'center' }}>
        <h3>문제 QR 코드</h3>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          marginTop: 10,
          padding: 20,
          backgroundColor: 'white',
          borderRadius: 8
        }}>
          <QRCodeSVG 
            value={`/quizes/${question.id}`}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
      </div>
    </div>
  );
}
