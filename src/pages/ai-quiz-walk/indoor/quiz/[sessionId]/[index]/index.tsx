import dynamic from "next/dynamic";

const SessionClient = dynamic(() => import("@/features/quiz/SessionClient"), {
  ssr: false,
});

export default function CreatePage() {
  return <SessionClient />;
}
