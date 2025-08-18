import dynamic from "next/dynamic";

const CreateClient = dynamic(() => import("@/features/quiz/ListClient"), {
  ssr: false,
});

export default function CreatePage() {
  return <CreateClient />;
}
