import { useEffect, useState } from "react";

export default function SplashApp2({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-green-100">
        <h1 className="text-3xl font-bold text-green-800">
          단원 김홍도와 함께하는 <br /> 방탈출 퀴즈
        </h1>
      </div>
    );
  }

  return <>{children}</>;
}
