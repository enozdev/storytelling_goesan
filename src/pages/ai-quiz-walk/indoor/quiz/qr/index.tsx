import dynamic from "next/dynamic";

const QrClient = dynamic(() => import("@/features/quiz/QrClient"), {
  ssr: false,
});

export default function CreatePage() {
  return <QrClient />;
}
