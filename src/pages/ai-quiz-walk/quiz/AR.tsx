import React, { useState, useRef, useEffect } from "react";

export default function AR() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // 후면 카메라 사용
          },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (error) {
        console.error("카메라 접근 오류:", error);
        alert("카메라 접근에 실패했습니다. 권한을 확인해주세요.");
      }
    };
    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop()); // 스트림 중지
        videoRef.current.srcObject = null; // 비디오 소스 초기화
      }
    };
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-auto max-w-md rounded-lg"
      />
    </div>
  );
}
