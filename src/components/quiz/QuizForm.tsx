import { useState } from "react";

interface QuizFormProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
  teamName: string;
  onTeamNameChange: (value: string) => void;
}

export default function QuizForm({
  onSubmit,
  isLoading,
  teamName,
  onTeamNameChange,
}: QuizFormProps) {
  const [topic, setTopic] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(topic);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <form onSubmit={handleSubmit}>
        <div className="text-2xl mb-4 items-center flex flex-col">
          괴산깜돌특별팀
        </div>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="예: 괴산의 역사, 괴산의 특산물"
          style={{ width: "100%", padding: "10px 10px", fontSize: 16 }}
          disabled={isLoading}
          className="border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{ marginTop: 10, padding: "10px 20px" }}
          className="w-full py-3 bg-green-600 text-white rounded-lg text-base font-semibold hover:bg-green-700 transition"
        >
          {isLoading ? "생성중..." : "AI로 문제 생성하기"}
        </button>
      </form>
    </div>
  );
}
