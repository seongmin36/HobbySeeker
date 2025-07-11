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
    // 하드코딩된 한국어 취미 추천 데이터
    const koreanHobbies = [
      {
        name: "도예 만들기",
        description: "흙을 이용해 그릇이나 장식품을 만드는 전통적인 취미입니다. 손으로 직접 만지며 창작하는 과정에서 깊은 만족감을 느낄 수 있습니다.",
        recommendationScore: 85,
        reasons: ["창의력 발달", "스트레스 해소", "실용적인 결과물"],
        estimatedCost: "월 5-10만원",
        timeCommitment: "주 2-3시간",
        skillLevel: "초급자",
        socialAspect: "그룹"
      },
      {
        name: "캘리그라피",
        description: "아름다운 손글씨를 쓰는 예술 활동입니다. 마음의 평온함을 찾고 집중력을 기를 수 있는 취미입니다.",
        recommendationScore: 80,
        reasons: ["집중력 향상", "정신적 안정", "예술적 감각"],
        estimatedCost: "월 3-5만원",
        timeCommitment: "주 1-2시간",
        skillLevel: "초급자",
        socialAspect: "개인"
      },
      {
        name: "베이킹",
        description: "맛있는 빵과 디저트를 만들며 창의력을 발휘하는 취미입니다. 가족과 친구들과 함께 나누는 즐거움이 있습니다.",
        recommendationScore: 90,
        reasons: ["실용적 결과물", "창의력 발달", "사회적 공유"],
        estimatedCost: "월 8-15만원",
        timeCommitment: "주 3-4시간",
        skillLevel: "초급자",
        socialAspect: "둘 다"
      },
      {
        name: "원예 가꾸기",
        description: "식물을 기르며 자연과 교감하는 힐링 취미입니다. 작은 화분부터 시작해서 점차 확장할 수 있습니다.",
        recommendationScore: 75,
        reasons: ["자연 교감", "힐링 효과", "성취감"],
        estimatedCost: "월 2-7만원",
        timeCommitment: "주 1-2시간",
        skillLevel: "초급자",
        socialAspect: "개인"
      },
      {
        name: "독서 클럽",
        description: "다양한 책을 읽고 토론하며 지식을 넓히는 취미입니다. 새로운 사람들과 의견을 나누는 즐거움이 있습니다.",
        recommendationScore: 85,
        reasons: ["지식 확장", "사회적 교류", "사고력 향상"],
        estimatedCost: "월 3-8만원",
        timeCommitment: "주 2-3시간",
        skillLevel: "초급자",
        socialAspect: "그룹"
      }
    ];

    // 사용자 프로필을 기반으로 추천 점수 조정
    const adjustedHobbies = koreanHobbies.map(hobby => {
      let score = hobby.recommendationScore;
      
      // MBTI 기반 조정
      if (profile.mbti) {
        if (profile.mbti.includes('I') && hobby.socialAspect === '개인') score += 10;
        if (profile.mbti.includes('E') && hobby.socialAspect === '그룹') score += 10;
        if (profile.mbti.includes('N') && hobby.name.includes('창작')) score += 5;
        if (profile.mbti.includes('S') && hobby.name.includes('실용')) score += 5;
      }
      
      // 네트워킹 선호도 기반 조정
      if (profile.networkingPreference && hobby.socialAspect === '그룹') score += 15;
      if (!profile.networkingPreference && hobby.socialAspect === '개인') score += 10;
      
      return { ...hobby, recommendationScore: Math.min(score, 100) };
    });

    // 상위 3-4개 추천 반환
    return adjustedHobbies
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 4);

    const rawJson = response.text;
    console.log("Gemini response:", rawJson);
    
    if (rawJson) {
      try {
        const data = JSON.parse(rawJson);
        return data.recommendations || [];
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        // If JSON parsing fails, try to extract recommendations manually
        const recommendations = [];
        // For now, return empty array and log the error
        console.error("Failed to parse JSON response from Gemini");
        return [];
      }
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Error generating hobby recommendations:", error);
    throw new Error(`Failed to generate hobby recommendations: ${error}`);
  }
}
