import React from "react";

const QuizList = () => {
  return (
    <div style={{ padding: 20, width: "40%", margin: "0 auto" }}>
      <h1 className="text-2xl font-bold mb-4">퀴즈 목록</h1>
      <div className="grid gap-4">{/* 퀴즈 목록이 여기에 표시됩니다 */}</div>
    </div>
  );
};

export default QuizList;
