import { useState, useEffect } from 'react';

interface Conversation {
  role: string;
  parts: { text: string }[];
}

export function useConversation() {
  const [conversationHistory, setConversationHistory] = useState<Conversation[]>([]);

  // 컴포넌트 마운트 시 localStorage에서 대화 기록 불러오기
  useEffect(() => {
    const savedHistory = localStorage.getItem('conversationHistory');
    if (savedHistory) {
      setConversationHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 대화 기록 추가 및 localStorage에 저장
  const addToHistory = (message: Conversation) => {
    const newHistory = [...conversationHistory, message];
    setConversationHistory(newHistory);
    localStorage.setItem('conversationHistory', JSON.stringify(newHistory));
  };

  // 대화 기록 초기화
  const clearHistory = () => {
    setConversationHistory([]);
    localStorage.removeItem('conversationHistory');
  };

  return {
    conversationHistory,
    addToHistory,
    clearHistory
  };
} 