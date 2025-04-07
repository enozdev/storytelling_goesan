import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextApiResponse, NextApiRequest } from "next";

let conversationHistory: any[] = [];
 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  if (req.method !== "POST") {    // GPT method는 POST 방식만 허용 (모델 목록 조회시에는 GET 쓰기도 하는데 대화 생성이나 텍스트 생성은 POST 방식만 허용)
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.GEMINI_API_KEY) {  // ts error 방지
    return res.status(500).json({ error: "GEMINI_API_KEY is not defined" });
  }

  const { message, options } = req.body;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

   // "괴산"만 허용
   if (!message.includes("괴산")) {
    return res.status(200).json({ text: "그건 알맞지 않은 질문이에요!" });
  }

  const prompt = `
  너는 대한민국 충청북도 괴산군에 대한 '${message}' 주제를 바탕으로 문제를 생성할 거야.

절대로 상상하거나 추측하지 말고, 반드시 신뢰할 수 있는 실제 정보(정부 자료, 위키백과 등)만 사용해.
정보가 확실하지 않으면 그에 대한 문제를 만들지 말고 건너뛰어.
문제를 제작할 때 절대 가정을 하지마.

다음 조건을 반드시 지켜:

- '${message}'을 기반으로 한 4지선다형 문제를 10개 만들어줘
- 각 문제는 질문, 보기(A~D), 정답이 포함되어야 함
- 난이도는 다양하게 구성해줘
- 허구의 정보, 추측, 상상력은 절대 금지
- 순수 JSON 형식으로만 출력할 것 (마크다운이나 다른 형식 없이):

{
  "questions": [
    {
      "id": 1,
      "question": "질문 내용",
      "options": {
        "A": "보기 A 내용",
        "B": "보기 B 내용",
        "C": "보기 C 내용",
        "D": "보기 D 내용"
      },
      "answer": "정답 (A, B, C, D 중 하나)"
    }
  ]
}
`;

  conversationHistory.push({ role: "user", parts: [{ text: prompt }] });

  try {
    const result = await model.generateContent({
      contents: conversationHistory,
    });

    const response = await result.response;
    const text = response.text();
    
    try {
      // 마크다운 형식 제거
      const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
      const jsonResponse = JSON.parse(cleanJson);
      res.status(200).json(jsonResponse);
    } catch (parseError) {
      res.status(200).json({ text });
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to fetch from Gemini API" });
  }
}
