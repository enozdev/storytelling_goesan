import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import { useRouter } from 'next/router';

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

export default function Quiz() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 페이지 로드 시 저장된 퀴즈 불러오기
  useEffect(() => {
    const savedQuestions = localStorage.getItem('quizQuestions');
    if (savedQuestions) {
      setQuizzes(JSON.parse(savedQuestions));
    }
  }, []);

  const handleSubmit = async () => {
    try {
      setError("");
      setIsLoading(true);
      const res = await fetch("/api/geminiAPI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: topic,
          options: []
        }),
      });

      const data = await res.json();
      console.log("API 응답:", data);

      if (data.error) {
        setError(data.error);
        setQuizzes([]);
      } else if (data.quizzes) {
        setQuizzes(data.quizzes);
        // 퀴즈 데이터를 localStorage에 저장
        localStorage.setItem('quizQuestions', JSON.stringify(data.quizzes));
      } else if (data.text) {
        setError(data.text);
        setQuizzes([]);
      } else {
        setError("알 수 없는 응답 형식입니다.");
        setQuizzes([]);
      }
    } catch (err) {
      console.error("API 호출 에러:", err);
      setError("API 호출 중 오류가 발생했습니다.");
      setQuizzes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 저장된 퀴즈 삭제 함수
  const clearSavedQuestions = () => {
    localStorage.removeItem('quizQuestions');
    setQuizzes([]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>괴산 문제 생성기</h1>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="예: 괴산의 역사, 괴산의 특산물"
        style={{ width: "100%", padding: 10, fontSize: 16 }}
      />
      <button 
        onClick={handleSubmit} 
        style={{ marginTop: 10 }}
        disabled={isLoading}
      >
        {isLoading ? "생성중..." : "문제 생성하기"}
      </button>
      
      {error && (
        <div>
          {error}
        </div>
      )}
      
      {isLoading && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <p>문제를 생성하고 있습니다. 잠시만 기다려주세요...</p>
        </div>
      )}
      
      {quizzes.length > 0 && (
        <button 
          onClick={clearSavedQuestions}
          style= {{ backgroundColor: '#ff4443',
                    color: 'white',
                  }}
        >
          저장된 퀴즈 삭제
        </button>
      )}
      
      <div style={{ marginTop: 20 }}>
        {quizzes.map((q) => (
          <div 
            key={q.id} 
            style={{ 
              marginBottom: 20, 
              padding: 15, 
              border: '1px solid #ddd', 
              borderRadius: 5,
              cursor: 'pointer'
            }}
            onClick={() => router.push(`/quizzes/${q.id}`)}
          >
            <h3>문제 {q.id}</h3>
            <p><strong>질문:</strong> {q.question}</p>
            <div>
              <strong>보기:</strong>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {Object.entries(q.options).map(([key, value]) => (
                  <li key={key}>{key}. {value}</li>
                ))}
              </ul>
            </div>
            <p><strong>정답:</strong> {q.answer}</p>
            <div style={{ marginTop: 10, textAlign: 'center' }}>
              <QRCodeSVG 
                value={`/quizzes/${q.id}`}
                size={100}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}