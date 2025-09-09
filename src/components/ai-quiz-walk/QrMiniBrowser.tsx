import React from "react";

type Props = {
  url: string;
  onClose: () => void;
};

export default function QrMiniBrowser({ url, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Dimmed backdrop */}
      <button
        aria-label="닫기"
        className="absolute inset-0 bg-black/5"
        onClick={onClose}
      />

      {/* Centered modal */}
      <div className="relative w-[92vw] max-w-[450px] h-[60vh] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20 bg-white">
        {/* Top-right close */}
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={onClose}
            className="rounded-full bg-black/70 text-white text-xs px-3 py-1.5 hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label="미리보기 닫기"
          >
            닫기
          </button>
        </div>

        {/* Preview */}
        <iframe
          title="QR 미리보기"
          src={url}
          className="w-full h-full border-0 bg-white"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
