// pages/ai-quiz-walk/outdoor/scanner.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import QrMiniBrowser from "@/components/ai-quiz-walk/QrMiniBrowser";

type TorchCapabilities = Partial<MediaTrackCapabilities> & { torch?: boolean };
type TorchConstraint = { advanced?: Array<{ torch?: boolean }> };

function isHttpUrl(text: string): boolean {
  try {
    const u = new URL(text);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function OutdoorScannerPage(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>("");
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const [decodedText, setDecodedText] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
        // 컴포넌트가 언마운트 되었거나 참조가 없는 경우
        stream.getTracks().forEach((t) => t.stop());
        setError("비디오 엘리먼트를 찾을 수 없습니다.");
        return;
      }

      video.srcObject = stream;
      await video.play();

      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      trackRef.current = track;

      // 캡처 가능한지 및 torch 지원 여부 확인
      const caps: TorchCapabilities =
        typeof track.getCapabilities === "function"
          ? (track.getCapabilities() as TorchCapabilities)
          : {};

      setTorchSupported(Boolean(caps && "torch" in caps));

      setReady(true);
    } catch (e: unknown) {
      // 에러 메시지 내로잉
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
      setDecodedText(text);
      setPreviewUrl(isHttpUrl(text) ? text : null);

      // 1회 인식 후 루프 중단 (재개는 onClosePreview에서)
      return;
    }

    rafRef.current = requestAnimationFrame(scanLoop);
  }, []);

  // 시작/정지 관리
  useEffect(() => {
    if (!isSecure) {
      setError("HTTPS 환경(혹은 localhost)에서만 카메라 사용이 가능합니다.");
      return;
    }
    void startCamera();

    return () => {
      stopAll();
    };
  }, [isSecure, startCamera, stopAll]);

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

  // 손전등 토글
  const toggleTorch = useCallback(async (): Promise<void> => {
    const track = trackRef.current;
    if (!track) return;

    try {
      const caps: TorchCapabilities =
        typeof track.getCapabilities === "function"
          ? (track.getCapabilities() as TorchCapabilities)
          : {};
      if (!("torch" in caps)) return;

      const constraints: MediaTrackConstraints & TorchConstraint = {
        advanced: [{ torch: !torchOn }],
      };
      await track.applyConstraints(constraints);
      setTorchOn((v) => !v);
    } catch (e) {
      // 일부 브라우저는 실패 가능 (권한/디바이스 미지원)
      console.log("torch not supported or applyConstraints failed", e);
    }
  }, [torchOn]);

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
        // 단순 알림은 유지
        alert("복사되었습니다.");
      }
    } catch {
      // 무시
    }
  }, [decodedText]);

  return (
    <main className="relative min-h-[100dvh] bg-black text-white">
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
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
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
            {decodedText && (
              <button
                onClick={copyDecoded}
                className="rounded-lg bg-white/90 text-black px-3 py-2 text-xs hover:bg-white"
              >
                텍스트 복사
              </button>
            )}
            {torchSupported && (
              <button
                onClick={toggleTorch}
                className="rounded-lg bg-white/90 text-black px-3 py-2 text-xs hover:bg-white"
              >
                {torchOn ? "플래시 끄기" : "플래시 켜기"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 미니 브라우저 (반창) */}
      {previewUrl && (
        <QrMiniBrowser url={previewUrl} onClose={onClosePreview} />
      )}
    </main>
  );
}
