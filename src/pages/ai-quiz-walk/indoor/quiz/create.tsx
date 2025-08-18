import dynamic from "next/dynamic";

const CreateClient = dynamic(() => import("@/features/quiz/CreateClient"), {
  ssr: false,
});

export default function CreatePage() {
  return <CreateClient />;
}
