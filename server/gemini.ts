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

export async function generateHobbyRecommendations(
  profile: UserProfile,
): Promise<HobbyRecommendation[]> {
  try {
    const systemPrompt = `당신은 창의적인 취미 추천 전문가입니다.
사용자의 프로필을 분석하여 개인화된 취미 추천을 제공하세요.
사용자의 선호도에 맞는 독특하고 흥미로운 취미에 초점을 맞춰주세요.
MBTI 유형, 예산, 시간 가용성, 선호도를 고려하세요.
금지된 취미는 완전히 피해주세요.

**중요 지침:**
- 모든 응답은 반드시 한국어로만 작성
- 취미 이름을 재미있고 매력적으로 표현 (예: "집 안의 작은 농장주", "디지털 세계의 건축가", "미니어처 세계의 신")
- 난이도를 이색적이고 유머러스하게 표현 (예: "호기심 단계", "열정 폭발 단계", "마스터 지경", "전설의 경지")
- 창의적이고 독특한 표현 사용

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
      "skillLevel": "재미있는 난이도 표현",
      "socialAspect": "개인/그룹/둘 다"
    }
  ]
}`;

    const userPrompt = `사용자 프로필:
- 성별: ${profile.gender || "미지정"}
- 나이: ${profile.age || "미지정"}
- MBTI: ${profile.mbti || "미지정"}
- 예산: ${profile.budget || "미지정"}
- 시간 가용성: ${profile.timeAvailability || "미지정"}
- 네트워킹 선호도: ${profile.networkingPreference ? "예" : "아니오"}
- 독특한 취미 선호도: ${profile.uniqueHobbyPreference ? "예" : "아니오"}
- 금지된 취미: ${profile.blacklistedHobbies?.join(", ") || "없음"}

이 프로필을 기반으로 3-5개의 개인화된 취미 추천을 한국어로 제공해주세요.

**특별 요구사항:**
- 취미 이름을 재미있고 창의적으로 표현 (예: "집 안의 작은 농장주", "색깔 마법사", "미니어처 세계의 신")
- 난이도를 이색적이고 유머러스하게 표현 (예: "호기심 단계", "열정 폭발 단계", "마스터 지경", "전설의 경지", "신의 경지")
- 모든 내용을 한국어로만 작성
- 창의적이고 독특한 표현 사용`;

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
                  description: {
                    type: "string",
                    description: "상세한 설명 (한국어)",
                  },
                  recommendationScore: { type: "number" },
                  reasons: {
                    type: "array",
                    items: { type: "string" },
                    description: "추천 이유들 (한국어)",
                  },
                  estimatedCost: {
                    type: "string",
                    description: "비용 범위 (한국어)",
                  },
                  timeCommitment: {
                    type: "string",
                    description: "필요한 시간 (한국어)",
                  },
                  skillLevel: {
                    type: "string",
                    description: "난이도 (한국어)",
                  },
                  socialAspect: {
                    type: "string",
                    description: "사회적 측면 (한국어)",
                  },
                },
                required: [
                  "name",
                  "description",
                  "recommendationScore",
                  "reasons",
                  "estimatedCost",
                  "timeCommitment",
                  "skillLevel",
                  "socialAspect",
                ],
              },
            },
          },
          required: ["recommendations"],
        },
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${userPrompt}

언어 요구사항:
- 모든 텍스트는 한국어로 작성
- 영어 단어나 문장 사용 금지
- 취미 이름도 한국어로 표기
- 전문 용어도 한국어로 번역하여 사용`,
            },
          ],
        },
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
