import { useRouter } from "next/router";
import { HomeIcon } from "@heroicons/react/24/solid";

export default function Scan() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">QR 코드 스캔</h1>
      <p className="text-gray-600 mb-8">
        QR 코드를 스캔하여 퀴즈를 시작하세요.
      </p>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => (window.location.href = "/quiz/scan/qr")}
      >
        QR 코드 스캔하기
      </button>

      <div className="mt-10 w-full max-w-md mx-auto">
        <button
          onClick={() => router.push("/")}
          className="w-full py-3 text-blue-700 rounded-xl text-lg font-bold shadow transition flex items-center justify-center gap-2"
        >
          <HomeIcon className="w-6 h-6" />
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
