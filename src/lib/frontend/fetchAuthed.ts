// authedFetch.ts (또는 컴포넌트 내부 유틸)
export async function fetchAuthed(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  // access_token / accessToken 둘 다 지원
  const token =
    (typeof window !== "undefined" &&
      (localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token"))) ||
    "";

  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`); // ✅ privateAuth가 기대하는 헤더
    headers.set("accessToken", token); // (선택) 레거시 호환
  }
  if (!headers.has("Content-Type") && init.body)
    headers.set("Content-Type", "application/json");

  const res = await fetch(input, { ...init, headers });
  let json: any = null;
  try {
    json = await res.json();
  } catch {}

  // 서버가 갱신 토큰을 내려주면 동일 키로 갱신
  if (json?.token && typeof json.token === "string") {
    localStorage.setItem("accessToken", json.token);
  }
  return { res, json };
}
