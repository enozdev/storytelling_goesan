import { useRouter } from "next/router";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

interface Quiz {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  questionOrder: number;
  quizSetId: number;
}

interface QuizSet {
  id: number;
  title: string;
  topic: string;
  quizzes: Quiz[];
  createdBy: string;
}

export default function QuizSetDetail() {
  const router = useRouter();
  const { quizSetId } = router.query;
  const [quizSet, setQuizSet] = useState<QuizSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [device, setDevice] = useState<string>("");

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch("/api/getIp");
        if (!response.ok) {
          throw new Error("IP 주소를 가져오는데 실패했습니다.");
        }
        const data = await response.json();
        setDevice(data.ip);
      } catch (err) {
        console.error("IP 주소 가져오기 에러:", err);
        setError("IP 주소를 가져오는데 실패했습니다.");
      }
    };

    fetchIp();
  }, []);

  useEffect(() => {
    if (!device || !quizSetId) return;

    const fetchQuizSet = async () => {
      try {
        const response = await fetch(`/api/quiz/${device}/${quizSetId}`);
        if (!response.ok) {
          throw new Error("퀴즈 세트를 불러오는데 실패했습니다.");
        }
        const data = await response.json();
        setQuizSet(data);
      } catch (err) {
        setError("데이터를 불러오는데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizSet();
  }, [device, quizSetId]);

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>{error}</div>;
  if (!quizSet) return <div>퀴즈 세트를 찾을 수 없습니다.</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{quizSet.title}</h1>
      <h2>주제: {quizSet.topic}</h2>

      {quizSet.quizzes.map((quiz) => (
        <div
          key={quiz.id}
          style={{
            marginBottom: 30,
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        >
          <h2>문제 {quiz.questionOrder}</h2>
          <p>{quiz.question}</p>

          <div style={{ marginBottom: 20 }}>
            <h3>보기</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li>A. {quiz.optionA}</li>
              <li>B. {quiz.optionB}</li>
              <li>C. {quiz.optionC}</li>
              <li>D. {quiz.optionD}</li>
            </ul>
          </div>

          <div style={{ marginTop: 20, textAlign: "center" }}>
            <h3>문제 QR 코드</h3>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 10,
                padding: 20,
                backgroundColor: "white",
                borderRadius: 8,
              }}
            >
              <QRCodeSVG
                value={`${window.location.origin}/quiz/my_quiz/${device}/${quiz.id}`}
                size={200}
                level="H"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
