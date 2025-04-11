import React from 'react';
import { useRouter } from 'next/router';

const QuizList = () => {
  const router = useRouter();

  React.useEffect(() => {
    const checkSession = () => {
      const adminSession = document.cookie
        .split('; ')
        .find(row => row.startsWith('adminSession='))
        ?.split('=')[1];

      console.log('Parsed cookie:', adminSession);

      if (!adminSession) {
        router.push('/adminLogin');
        return;
      }

      try {
        const sessionData = JSON.parse(adminSession);
        console.log('Session data:', sessionData);
        
        if (Date.now() > sessionData.expiresAt) {
          router.push('/adminLogin');
        }
      } catch (error) {
        console.error('Error parsing session:', error);
        router.push('/adminLogin');
      }
    };

    checkSession();
  }, [router]);

  return (  
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">퀴즈 목록</h1>
      <div className="grid gap-4">
        {/* 퀴즈 목록이 여기에 표시됩니다 */}
      </div>
    </div>
  );
};

export default QuizList;
