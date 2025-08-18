// src/hooks/useAuth.ts
import { useCallback } from "react";
import { apiClient } from "@/lib/apiClient";

type LoginDto = { userTeamName: string; userTeamPassword: string };
type UserLoginResponse = { accessToken: string; idx: number };

export function useAuth() {
  const userLogin = useCallback(
    async (dto: LoginDto): Promise<UserLoginResponse> => {
      const res = await apiClient("/api/auth/user/login", {
        method: "POST",
        body: JSON.stringify(dto),
      });

      // TODO: API 에러에 따른 에러 처리 로직 추가
      // 예시: 401 Unauthorized, 403 Forbidden 등
      if (!res.ok) {
        throw new Error("USER_LOGIN_FAILED");
      }
      const data = (await res.json()) as UserLoginResponse;

      // 저장은 여기서 수행 (원하면 호출부로 이동 가능)
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user_id", String(data.idx));
      localStorage.setItem("userTeamName", dto.userTeamName);

      return data;
    },
    []
  );

  const adminLogin = useCallback(async (dto: LoginDto): Promise<void> => {
    // apiClient가 Authorization 자동 부착
    const res = await apiClient("/api/auth/admin/login", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      throw new Error("ADMIN_LOGIN_FAILED");
    }
  }, []);

  return { userLogin, adminLogin };
}
