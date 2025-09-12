export type AuthOK = {
  success: true;
  idx: number;
  token?: string;
  // 필요 시 확장:
  // adminId?: number;
  // role?: string;
};

export type AuthFail = {
  success: false;
  code?: number;
  errorCode?: string;
  error: string;
};

export type AuthResult = AuthOK | AuthFail;

// 타입 가드(편의용)
export function isAuthOK(r: AuthResult): r is AuthOK {
  return r.success === true;
}
