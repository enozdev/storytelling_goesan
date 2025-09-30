import { useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

type Props = {
  asButton?: boolean;
  children?: (install: () => Promise<void>) => React.ReactNode;
};

export default function InstallAction({ asButton = true, children }: Props) {
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const onBIP = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
      setAvailable(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  const install = async () => {
    const ev = deferredRef.current;
    if (!ev) return;
    await ev.prompt();
    setAvailable(false);
    deferredRef.current = null;
  };

  if (!available) return null;

  if (!asButton && typeof children === "function") {
    return <>{children(install)}</>;
  }

  return (
    <button onClick={install} className="text-sm">
      앱 설치
    </button>
  );
}
