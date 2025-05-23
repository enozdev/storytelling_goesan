import router from "next/router";
import { useState } from "react";
export default function Login() {
  const [adminID, setAdminID] = useState("");
  const [adminPWD, setAdminPWD] = useState("");

  const handleLogin = async () => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ adminID, adminPWD }),
    });

    if (response.ok) {
      router.push("/quiz/quizList");
    } else {
      alert("로그인 실패");
    }
  };

  return (
    <div style={{ width: "40%", margin: "0 auto" }}>
      <h1>관리자 로그인</h1>

      <div>
        <input
          type="text"
          placeholder="아이디"
          style={{ width: "20%", marginRight: "10px", marginBottom: "10px" }}
          onChange={(e) => setAdminID(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          style={{ width: "20%", marginBottom: "10px" }}
          onChange={(e) => setAdminPWD(e.target.value)}
        />
      </div>

      <button
        style={{ marginRight: "10px", marginTop: "10px" }}
        onClick={handleLogin}
      >
        로그인
      </button>
      <button onClick={() => router.push("/")}>홈으로</button>
    </div>
  );
}
