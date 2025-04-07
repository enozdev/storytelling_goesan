import router from "next/router";


export default function Home() {
  return <div>
    <button onClick={() => router.push('/quiz')}>퀴즈 생성</button>
  </div>;
}