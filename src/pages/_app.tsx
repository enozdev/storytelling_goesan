import "../styles/globals.css";
import type { AppProps } from "next/app";
import SplashApp1 from "@/components/ai-quiz-walk/splash";
import SplashApp2 from "@/components/escape-room/splash";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const path = router.pathname;

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
