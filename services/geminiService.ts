
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getWeddingAdvice = async (prompt: string, context?: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: You are a Thai wedding expert assistant named 'Sarn Rak'. 
      Help the couple plan their wedding according to Thai traditions. 
      Current User Status: ${context || 'Just starting planning'}
      User Question: ${prompt}`,
      config: {
        systemInstruction: "You provide warm, expert advice on Thai wedding planning. Use polite Thai language (Krub/Ka). Offer practical tips and explain traditional meanings when asked.",
        temperature: 0.7,
      }
    });
    return response.text || "ขออภัยครับ ไม่สามารถดึงข้อมูลคำแนะนำได้ในขณะนี้";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับผู้ช่วย AI กรุณาลองใหม่อีกครั้ง";
  }
};

export const generateBackdropIdea = async (themeName: string, primaryColor: string, secondaryColor: string, details: string) => {
  try {
    const prompt = `A professional, high-quality 3D architectural render of a Thai wedding backdrop. 
    Theme: ${themeName}. 
    Primary Color: ${primaryColor}, Secondary Color: ${secondaryColor}. 
    Specific Details: ${details}. 
    The design should look elegant, traditional yet modern, featuring Thai floral patterns (Phuang Malai), silk textures, and professional wedding lighting. 
    Cinematic photography style, 8k resolution.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};

export const generateWeddingChecklist = async (budget: number, guestCount: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `สร้างรายการสิ่งที่ต้องทำสำหรับการจัดงานแต่งงานแบบไทยด้วยงบประมาณ ${budget} บาท สำหรับแขก ${guestCount} คน ขอเป็นรูปแบบ JSON array ของ object ที่มี fields: task, priority (high/medium/low), and estimated_cost.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              task: { type: Type.STRING },
              priority: { type: Type.STRING },
              estimated_cost: { type: Type.NUMBER }
            },
            required: ["task", "priority", "estimated_cost"]
          }
        }
      }
    });
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};
