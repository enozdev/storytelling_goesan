import "@/styles/globals.css";
import type { AppProps } from "next/app";
import SplashApp1 from "@/components/ai-quiz-walk/splash";
import SplashApp2 from "@/components/escape-room/splash";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const path = router.pathname;

  // 조용히 Service Worker 등록 (실패 무시)
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  if (path.startsWith("/ai-quiz-walk")) {
    return (
      <SplashApp1>
        <Component {...pageProps} />
      </SplashApp1>
    );
  }
  if (path.startsWith("/escape-room")) {
    return (
      <SplashApp2>
        <Component {...pageProps} />
      </SplashApp2>
    );
  }

  return <Component {...pageProps} />;
}
