// src/pages/user/login.tsx
import { useRouter } from "next/router";
import LoginForm from "@/components/user/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { userLogin, adminLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUserLogin = async (payload: {
    userTeamName: string;
    userTeamPassword: string;
  }) => {
    try {
      setLoading(true);
      await userLogin(payload);
      const redirect =
        typeof router.query.redirect === "string"
          ? router.query.redirect
          : "/ai-quiz-walk";
      router.push(redirect);
    } catch (e: any) {
      // 아이디, 비밀번호 오류 처리
      console.log("로그인 에러:", e);
      console.log("에러 응답:", e?.response);
      if (e.response && e.response.status === 401) {
        alert("비밀번호가 잘못되었습니다.");
      } else if (e.response && e.response.status === 403) {
        alert("로그인 권한이 없습니다.");
      } else if (e.response && e.response.status === 404) {
        alert("팀이 존재하지 않습니다.");
      } else {
        // 기타 오류 처리
        alert("로그인 실패");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (payload: {
    userTeamName: string;
    userTeamPassword: string;
  }) => {
    try {
      setLoading(true);
      await adminLogin(payload);
      // 관리자 로그인 성공 후 이동 경로 정의
      router.push("/admin");
    } catch (e) {
      alert("관리자 로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginForm
      onUserLogin={handleUserLogin}
      onAdminLogin={handleAdminLogin}
      isLoading={loading}
    />
  );
}
