import { useRouter } from "next/router";
import { HomeIcon, QrCodeIcon } from "@heroicons/react/24/solid";

export default function Scan() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          🎉 QR 코드 스캔
        </h1>
        <p className="text-gray-700 text-base mb-8 leading-relaxed">
          축하합니다! 보물QR을 찾으셨나보네요! <br />
          아래 스캔 버튼을 눌러 QR 코드를 스캔해보세요. <br />
          스캔 후 퀴즈를 풀 수 있는 페이지로 이동합니다.
        </p>

        <button
          className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 mb-4"
          onClick={() => (window.location.href = "/quiz/scan/qr")}
        >
          <QrCodeIcon className="w-6 h-6" />
          QR 코드 스캔하기
        </button>

        <button
          onClick={() => router.push("/ai-quiz-walk")}
          className="w-full py-3 border-2 border-gray-300 bg-gray-50 text-gray-700 rounded-lg text-base font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition"
        >
          <HomeIcon className="w-6 h-6 text-gray-500" />
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
