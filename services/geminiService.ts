import { GoogleGenAI } from "@google/genai";
import { PERSONA_DATA } from "../constants";
import { Persona } from "../types";

// Safe initialization
const getAI = () => {
  const key = process.env.API_KEY;
  if (!key || key === "UNDEFINED" || key === "PLACEHOLDER_API_KEY") {
    console.warn("Gemini API Key is missing or invalid.");
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
};

export const getAIResponse = async (prompt: string, personas: Persona[]) => {
  try {
    const ai = getAI();
    if (!ai) {
      return "현재 AI 서비스와 연결할 수 없습니다. (API 키 확인 필요)";
    }

    const systemInstruction = personas
      .map((p) => PERSONA_DATA[p].instruction)
      .join("\n\n");

    // Correct usage of ai.models.generateContent and extracting .text property
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
      },
    });

    return response.text || "죄송해요, 다시 말씀해 주시겠어요?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "연결에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }
};
