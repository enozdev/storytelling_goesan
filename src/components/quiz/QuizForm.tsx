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
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            value={teamName}
            onChange={(e) => onTeamNameChange(e.target.value)}
            placeholder="팀명"
            style={{ width: "100%", padding: "10px 10px", fontSize: 16 }}
            disabled={isLoading}
          />
        </div>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="예: 괴산의 역사, 괴산의 특산물"
          style={{ width: "100%", padding: "10px 10px", fontSize: 16 }}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{ marginTop: 10, padding: "10px 20px" }}
        >
          {isLoading ? "생성중..." : "AI로 문제 생성하기"}
        </button>
      </form>
    </div>
  );
}
