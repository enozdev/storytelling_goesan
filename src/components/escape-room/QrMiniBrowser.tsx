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
            className="flex items-center gap-2 rounded-xl bg-yellow-600 text-white text-sm md:text-base font-bold px-5 py-2.5 shadow-lg hover:bg-yellow-700 hover:scale-105 active:scale-95 transition transform focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
            aria-label="미리보기 닫기"
          >
            {/* X 아이콘 (lucide-react나 heroicons 사용 가능) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 md:h-5 md:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
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
