"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import jsQR from "jsqr";
import QrMiniBrowser from "@/components/ai-quiz-walk/QrMiniBrowser";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  CheckBadgeIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

function isHttpUrl(text: string): boolean {
  try {
    const u = new URL(text);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const getInt = (key: string, fallback = 0): number => {
  try {
    const raw = localStorage.getItem(key);
    const n = raw !== null ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
};

// Authorization, 토큰 자동 갱신
async function authedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<{ res: Response; json: any }> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.body)
    headers.set("Content-Type", "application/json");

  const res = await fetch(input, { ...init, headers });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // no body
  }
  if (json?.token && typeof json.token === "string") {
    localStorage.setItem("access_token", json.token); // 만료 임박 시 갱신
  }
  return { res, json };
}

export default function OutdoorScannerPage(): JSX.Element {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>("");

  // 상단 정보 바 상태
  const [teamName, setTeamName] = useState<string>("게스트");
  const [foundCount, setFoundCount] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);

  const [decodedText, setDecodedText] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [elapsedTime, setElapsedTime] = useState<string>("00:00");
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const start = Date.now();
    interval = setInterval(() => {
      const diff = Date.now() - start;
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsedTime(
        `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isSecure =
    typeof window !== "undefined" &&
    (window.isSecureContext ||
      ["localhost", "127.0.0.1"].includes(window.location.hostname));

  const stopAll = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    trackRef.current = null;
    setReady(false);
  }, []);

  // 상단 정보 바 리프레시
  const refreshStatsFromStorage = useCallback(() => {
    try {
      setTeamName(localStorage.getItem("userTeamName") || "게스트");
      setFoundCount(getInt("found_count", 0));
      setCorrectCount(getInt("correct_count", 0));
    } catch {}
  }, []);

  const syncStatsFromServer = useCallback(async () => {
    try {
      const { res, json } = await authedFetch("/api/ai-quiz-walk/quiz/stats");
      if (res.ok && json) {
        if (typeof json.teamName === "string")
          localStorage.setItem("userTeamName", json.teamName);
        if (Number.isFinite(json.foundCount))
          localStorage.setItem("found_count", String(json.foundCount));
        if (Number.isFinite(json.correctCount))
          localStorage.setItem("correct_count", String(json.correctCount));
        refreshStatsFromStorage();
      }
    } catch {
      // ignore (게스트거나 네트워크 이슈 시 로컬 값만 사용)
    }
  }, [refreshStatsFromStorage]);

  // 카메라 시작
  const startCamera = useCallback(async (): Promise<void> => {
    try {
      setError("");

      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        setError("이 브라우저는 카메라를 지원하지 않습니다.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        setError("비디오 엘리먼트를 찾을 수 없습니다.");
        return;
      }

      video.srcObject = stream;
      await video.play();

      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      trackRef.current = track;

      setReady(true);
    } catch (e: unknown) {
      const msg =
        typeof e === "object" &&
        e !== null &&
        "message" in e &&
        typeof (e as { message: unknown }).message === "string"
          ? (e as { message: string }).message
          : "";

      console.error(e);

      if (!isSecure) {
        setError("HTTPS 환경(혹은 localhost)에서만 카메라 사용이 가능합니다.");
      } else if (
        msg.includes("NotAllowedError") ||
        msg.includes("Permission")
      ) {
        setError("카메라 권한이 거부되었습니다. 브라우저 권한을 허용해주세요.");
      } else {
        setError(
          "카메라를 시작할 수 없습니다. 권한 및 기기 상태를 확인해주세요."
        );
      }
    }
  }, [isSecure]);

  // 스캔 결과 처리(내부 라우팅 규칙 포함)
  const handleDecoded = useCallback(
    (text: string) => {
      setDecodedText(text);

      // 1) 외부/내부 HTTP(S) 링크는 미니 브라우저로
      if (isHttpUrl(text)) {
        setPreviewUrl(text);
        return;
      }

      // 2) 숫자만 → /ai-quiz-walk/open/{id}
      if (/^\d+$/.test(text)) {
        router.push(`/ai-quiz-walk/open/${encodeURIComponent(text)}`);
        return;
      }

      // 3) 슬래시로 시작하는 내부 경로 → 그 경로로 이동
      if (/^\/[A-Za-z0-9/_\-?=&.%]+$/.test(text)) {
        router.push(text);
        return;
      }
    },
    [router]
  );

  // 카메라/스캔 루프
  const scanLoop = useCallback((): void => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    // 중앙 크롭(정확도 향상을 위해 중앙 70% 영역 스캔)
    const cropScale = 0.7;
    const cw = Math.floor(w * cropScale);
    const ch = Math.floor(h * cropScale);
    const cx = Math.floor((w - cw) / 2);
    const cy = Math.floor((h - ch) / 2);

    ctx.drawImage(video, 0, 0, w, h);
    const img = ctx.getImageData(cx, cy, cw, ch);

    const code = jsQR(img.data, cw, ch, { inversionAttempts: "dontInvert" });
    if (code?.data) {
      const text = code.data.trim();
      handleDecoded(text);
      return;
    }

    rafRef.current = requestAnimationFrame(scanLoop);
  }, [handleDecoded]);

  // 시작/정지 + 스토리지/서버 동기화
  useEffect(() => {
    if (!isSecure) {
      setError("HTTPS 환경(혹은 localhost)에서만 카메라 사용이 가능합니다.");
      return;
    }
    void startCamera();
    refreshStatsFromStorage();
    void syncStatsFromServer();

    const handler = () => refreshStatsFromStorage();
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("storage", handler);
      stopAll();
    };
  }, [
    isSecure,
    startCamera,
    stopAll,
    refreshStatsFromStorage,
    syncStatsFromServer,
  ]);

  useEffect(() => {
    if (!ready) return;
    rafRef.current = requestAnimationFrame(scanLoop);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [ready, scanLoop]);

  // 다시 스캔(미니 브라우저 닫을 때)
  const onClosePreview = useCallback((): void => {
    setPreviewUrl(null);
    setDecodedText(null);
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(scanLoop);
  }, [scanLoop]);

  const copyDecoded = useCallback(async (): Promise<void> => {
    if (!decodedText) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(decodedText);
        alert("복사되었습니다.");
      }
    } catch {
      // 무시
    }
  }, [decodedText]);

  return (
    <main className="relative min-h-[100dvh] bg-black text-white">
      {/* === 팀명 / 소요 시간 / 정답 === */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-[max(0.25rem,env(safe-area-inset-top))] pointer-events-none">
        <div className="mx-auto max-w-[640px]">
          <div className="flex items-center justify-between gap-3 rounded-b-2xl bg-black/55 backdrop-blur px-3 py-2 ring-1 ring-white/10">
            {/* 팀명 */}
            <div className="min-w-0 flex items-center gap-2 text-xl font-semibold">
              <UserGroupIcon className="w-5 h-5 flex-shrink-0 opacity-90" />
              <span className="truncate">{teamName}</span>
            </div>

            {/* 중앙: 소요 시간 */}
            <div className="flex items-center gap-1 text-[15px] font-medium text-white/90">
              <ClockIcon className="w-4 h-4 opacity-90" />
              <span>{elapsedTime}</span>
            </div>

            {/* 정답 */}
            <div className="flex items-center gap-1 text-[15px]">
              <CheckBadgeIcon className="w-4 h-4 opacity-90" />
              <span className="opacity-90">정답 {correctCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 비디오 (풀스크린) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />
      {/* 디코드용 캔버스(숨김) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 상단 안내/에러 */}
      <div className="absolute left-0 right-0 top-12 md:top-14 p-4 pointer-events-none">
        {!error ? (
          <div className="mx-auto max-w-[640px] text-center">
            <p className="inline-block rounded-full bg-black/40 px-3 py-1 text-xs tracking-tight">
              QR을 화면 중앙 가이드에 맞춰주세요
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-[640px] text-center">
            <p className="inline-block rounded-xl bg-red-600/80 px-3 py-2 text-sm">
              {error}
            </p>
          </div>
        )}
      </div>

      {/* 중앙 가이드 프레임 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[68vmin] h-[68vmin] max-w-[80vw] max-h-[80vw] rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]" />
      </div>

      {/* 하단 컨트롤 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-[640px] flex items-center justify-between gap-3">
          <div className="min-w-0">
            {decodedText ? (
              <div className="truncate text-sm opacity-90">
                감지됨: {decodedText}
              </div>
            ) : (
              <div className="text-sm opacity-75">스캔 대기 중…</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {decodedText ? (
              <button
                onClick={copyDecoded}
                className="rounded-lg bg-white/90 text-black px-10 py-2 text-sm hover:bg-white"
              >
                복사
              </button>
            ) : null}
          </div>

          {!previewUrl ? (
            <button
              onClick={() => router.push("/escape-room/answering")}
              className="flex items-center justify-between gap-3 rounded-2xl bg-black/55 backdrop-blur px-3 py-2 ring-1 ring-white/10"
            >
              뒤로 가기
            </button>
          ) : null}
        </div>
      </div>

      {/* 미니 브라우저 (반창) */}
      {previewUrl ? (
        <QrMiniBrowser url={previewUrl} onClose={onClosePreview} />
      ) : null}
    </main>
  );
}
