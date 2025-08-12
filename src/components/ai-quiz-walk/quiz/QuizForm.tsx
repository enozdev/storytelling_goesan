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
    
  );
}
