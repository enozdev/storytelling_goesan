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

  const regenerateQuestion = async () => {
    try {
      const response = await fetch('/api/api_quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: quizid,
          message: localStorage.getItem('quizTopic'),
          conversationHistory: JSON.parse(localStorage.getItem('conversationHistory') || '[]'),
        }),
      });
      

      if (!response.ok) {
        throw new Error('문제 재생성에 실패했습니다.');
      }

      const data = await response.json();
      console.log("API 응답:", data);
      const newQuestion = data.quizzes[0];
      
      // 로컬 스토리지 업데이트
      const savedQuizzes = localStorage.getItem('quizQuestions');
      if (savedQuizzes) {
        const quizzes: Quiz[] = JSON.parse(savedQuizzes);
        const updatedQuizzes = quizzes.map(q =>
          q.id === Number(quizid) ? newQuestion : q
        );
        localStorage.setItem('quizQuestions', JSON.stringify(updatedQuizzes));
        setQuestion(newQuestion);
      }
    } catch (error) {
      console.error('문제 재생성 중 오류 발생:', error);
      alert('문제 재생성에 실패했습니다.');
    }
  };
  
  if (!question) {
    return <div>문제를 찾을 수 없습니다.</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>문제 {question.id}</h1>
      <div style={{ marginBottom: 20 }}>
        <button 
          style={{cursor: 'pointer'}}
          onClick={regenerateQuestion}
        >
          문제 재생성하기
        </button>
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
          />
        </div>
      </div>
    </div>
  );
}
