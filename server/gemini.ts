import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface UserProfile {
  gender?: string;
  age?: number;
  mbti?: string;
  budget?: string;
  timeAvailability?: string;
  networkingPreference?: boolean;
  uniqueHobbyPreference?: boolean;
  blacklistedHobbies?: string[];
}

export interface HobbyRecommendation {
  name: string;
  description: string;
  recommendationScore: number;
  reasons: string[];
  estimatedCost: string;
  timeCommitment: string;
  skillLevel: string;
  socialAspect: string;
}

export async function generateHobbyRecommendations(profile: UserProfile): Promise<HobbyRecommendation[]> {
  try {
    const systemPrompt = `당신은 취미 추천 전문가입니다.
사용자의 프로필을 분석하여 개인화된 취미 추천을 제공하세요.
사용자의 선호도에 맞는 독특하고 흥미로운 취미에 초점을 맞춰주세요.
MBTI 유형, 예산, 시간 가용성, 선호도를 고려하세요.
금지된 취미는 완전히 피해주세요.

**중요: 모든 응답은 반드시 한국어로만 작성해야 합니다. 영어로 답변하지 마세요.**
**Important: All responses must be written in Korean only. Do not respond in English.**

다음 JSON 형식으로 응답하세요:
{
  "recommendations": [
    {
      "name": "취미 이름",
      "description": "상세한 설명",
      "recommendationScore": number (1-100),
      "reasons": ["이유1", "이유2", "이유3"],
      "estimatedCost": "비용 범위",
      "timeCommitment": "필요한 시간",
      "skillLevel": "초급자/중급자/고급자",
      "socialAspect": "개인/그룹/둘 다"
    }
  ]
}`;

    const userPrompt = `사용자 프로필:
- 성별: ${profile.gender || '미지정'}
- 나이: ${profile.age || '미지정'}
- MBTI: ${profile.mbti || '미지정'}
- 예산: ${profile.budget || '미지정'}
- 시간 가용성: ${profile.timeAvailability || '미지정'}
- 네트워킹 선호도: ${profile.networkingPreference ? '예' : '아니오'}
- 독특한 취미 선호도: ${profile.uniqueHobbyPreference ? '예' : '아니오'}
- 금지된 취미: ${profile.blacklistedHobbies?.join(', ') || '없음'}

이 프로필을 기반으로 3-5개의 개인화된 취미 추천을 한국어로 제공해주세요.
모든 취미 이름, 설명, 이유, 비용, 시간, 난이도, 사회적 측면을 한국어로 작성해주세요.
절대 영어로 답변하지 마시고, 완전히 한국어로만 답변해주세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "취미 이름 (한국어)" },
                  description: { type: "string", description: "상세한 설명 (한국어)" },
                  recommendationScore: { type: "number" },
                  reasons: { type: "array", items: { type: "string" }, description: "추천 이유들 (한국어)" },
                  estimatedCost: { type: "string", description: "비용 범위 (한국어)" },
                  timeCommitment: { type: "string", description: "필요한 시간 (한국어)" },
                  skillLevel: { type: "string", description: "난이도 (한국어)" },
                  socialAspect: { type: "string", description: "사회적 측면 (한국어)" },
                },
                required: ["name", "description", "recommendationScore", "reasons", "estimatedCost", "timeCommitment", "skillLevel", "socialAspect"],
              },
            },
          },
          required: ["recommendations"],
        },
      },
      contents: [
        {
          role: "user", 
          parts: [{ 
            text: `${userPrompt}

언어 요구사항:
- 모든 텍스트는 한국어로 작성
- 영어 단어나 문장 사용 금지
- 취미 이름도 한국어로 표기
- 전문 용어도 한국어로 번역하여 사용

Language Requirements:
- All text must be in Korean
- No English words or sentences allowed
- Hobby names must be in Korean
- Technical terms must be translated to Korean`
          }]
        }
      ],
    });

    const rawJson = response.text;
    if (rawJson) {
      const data = JSON.parse(rawJson);
      return data.recommendations || [];
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Error generating hobby recommendations:", error);
    throw new Error(`Failed to generate hobby recommendations: ${error}`);
  }
}
