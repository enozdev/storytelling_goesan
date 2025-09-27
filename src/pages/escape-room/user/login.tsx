"use client";

import { useRouter } from "next/router";
import LoginForm from "@/components/escape-room/user/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { userLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUserLogin = async (payload: {
    userTeamName: string;
    userTeamPassword: string;
    role: string;
  }) => {
    try {
      setLoading(true);
      await userLogin(payload);
      const redirect =
        typeof router.query.redirect === "string"
          ? router.query.redirect
          : "/escape-room";
      router.push(redirect);
    } catch (e: any) {
      console.log("로그인 에러:", e);
      alert("로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm onUserLogin={handleUserLogin} isLoading={loading} />;
}
