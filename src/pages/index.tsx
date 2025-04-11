import router from "next/router";


export default function Home() {

  const handleLogout = () => {
    fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      } 
    });
  };

  return <div style={{ width: '40%', margin: '0 auto' }}>
    <button onClick={() => router.push('/quiz/createQuiz')}>퀴즈 생성</button>

    <button onClick={() => router.push('/adminLogin')}>관리자 로그인</button>
    <button onClick={handleLogout}>관리자 로그아웃</button>

    <button onClick={() => router.push('/quiz/quizList')}>로그인 체크</button>

  </div>;
}