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
  whitelistedHobbies?: string[];
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
      "estimatedCost": "간단한 비용 정보",
      "timeCommitment": "간단한 시간 정보",
      "skillLevel": "재미있는 난이도 표현",
      "socialAspect": "개인/그룹/둘 다"
    }
  ]
}`;

    let userPrompt = `사용자 프로필:
- 성별: ${profile.gender || "미지정"}
- 나이: ${profile.age || "미지정"}
- MBTI: ${profile.mbti || "미지정"}
- 예산: ${profile.budget || "미지정"}
- 시간 가용성: ${profile.timeAvailability || "미지정"}
- 네트워킹 선호도: ${profile.networkingPreference ? "예" : "아니오"}
- 독특한 취미 선호도: ${profile.uniqueHobbyPreference ? "예" : "아니오"}
- 금지된 취미: ${profile.blacklistedHobbies?.join(", ") || "없음"}
- 선호하는 취미: ${profile.whitelistedHobbies?.join(", ") || "없음"}

이 프로필을 기반으로 3-5개의 개인화된 취미 추천을 한국어로 제공해주세요.

**특별 요구사항:**
- 취미 이름을 한줄에 들어갈 수 있도록 짧고 창의적으로 표현 (예: "집안 농장주", "색깔 마법사", "미니어처 신", "코딩 건축가")
- 난이도를 6글자 이내로 이색적이고 유머러스하게 표현 (예: "호기심단계", "열정폭발", "마스터급", "전설급", "신의경지")
- 모든 내용을 한국어로만 작성
- 창의적이고 독특한 표현 사용
- 비용과 시간 정보를 간단하고 짧게 작성 (예: "5만원", "주 2시간")
- 괄호 사용 금지
- 선호하는 취미가 있다면 우선적으로 고려하세요
- 독특한 취미 선호도가 높다면 병맛 취미를 추천하세요 (예: "코스튬 댄스 마스터", "버블티 아티스트", "틱톡 댄스 크루", "마임 퍼포머", "플래시몹 기획자", "코스프레 제작자", "저글링 마에스트로", "라떼아트 화가", "미니어처 건축가", "레고 조각가", "종이접기 마술사", "펜스핀 챔피언")`;

    // Add unique hobby suggestions if preference is enabled
    if (profile.uniqueHobbyPreference) {
      userPrompt += `

**독특한 취미 특별 추천 목록:**
- 코스튬 댄스 동호회 (캐릭터 의상을 입고 춤추는 퍼포먼스 그룹)
- 버블티 마스터 (다양한 버블티 레시피 개발 및 토핑 아트)
- 틱톡 댄스 크루 (바이럴 댄스 챌린지 참여 및 창작)
- 마임 아티스트 (무언극 퍼포먼스 및 거리 공연)
- 플래시몹 기획자 (깜짝 단체 퍼포먼스 기획 및 참여)
- 코스프레 제작자 (캐릭터 의상 및 소품 제작)
- 저글링 마에스트로 (공 던지기부터 화염 퍼포먼스까지)
- 라떼아트 화가 (커피 위에 그림 그리기)
- 미니어처 건축가 (작은 세상 만들기)
- 레고 조각가 (블록으로 예술 작품 창작)
- 종이접기 마술사 (극한 오리가미 아트)
- 펜스핀 챔피언 (펜 돌리기 트릭 마스터)
- 케이팝 안무 커버 (아이돌 댄스 완벽 복사)
- 그래피티 아티스트 (합법적인 벽화 및 스트리트 아트)
- 타로 카드 리더 (카드 해석 및 미래 예측)
- 수정 수집가 (파워스톤 및 크리스탈 수집)
- 곤충 관찰자 (벌레 세계 탐험가)
- 화석 헌터 (고생물 유적 발굴)
- 우주 관측자 (별자리 및 행성 관찰)
- 발효 음식 연구자 (김치부터 치즈까지)
- 아이스크림 셰프 (홈메이드 젤라또 창작)
- 나무 조각사 (체인톱 아트부터 섬세한 조각까지)

이 중에서 사용자에게 적합한 독특하고 재미있는 취미를 우선적으로 추천하세요.`;
    }

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
