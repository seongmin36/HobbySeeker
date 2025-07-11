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
    const systemPrompt = `You are a hobby recommendation expert. 
Analyze the user's profile and provide personalized hobby recommendations.
Focus on unique and interesting hobbies that match their preferences.
Consider their MBTI type, budget, time availability, and preferences.
Avoid their blacklisted hobbies completely.
Respond with JSON in this format:
{
  "recommendations": [
    {
      "name": "hobby name",
      "description": "detailed description",
      "recommendationScore": number (1-100),
      "reasons": ["reason1", "reason2", "reason3"],
      "estimatedCost": "cost range",
      "timeCommitment": "time needed",
      "skillLevel": "beginner/intermediate/advanced",
      "socialAspect": "individual/group/both"
    }
  ]
}`;

    const userPrompt = `User Profile:
- Gender: ${profile.gender || 'Not specified'}
- Age: ${profile.age || 'Not specified'}
- MBTI: ${profile.mbti || 'Not specified'}
- Budget: ${profile.budget || 'Not specified'}
- Time Availability: ${profile.timeAvailability || 'Not specified'}
- Networking Preference: ${profile.networkingPreference ? 'Yes' : 'No'}
- Unique Hobby Preference: ${profile.uniqueHobbyPreference ? 'Yes' : 'No'}
- Blacklisted Hobbies: ${profile.blacklistedHobbies?.join(', ') || 'None'}

Please provide 3-5 personalized hobby recommendations based on this profile.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
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
                  name: { type: "string" },
                  description: { type: "string" },
                  recommendationScore: { type: "number" },
                  reasons: { type: "array", items: { type: "string" } },
                  estimatedCost: { type: "string" },
                  timeCommitment: { type: "string" },
                  skillLevel: { type: "string" },
                  socialAspect: { type: "string" },
                },
                required: ["name", "description", "recommendationScore", "reasons", "estimatedCost", "timeCommitment", "skillLevel", "socialAspect"],
              },
            },
          },
          required: ["recommendations"],
        },
      },
      contents: userPrompt,
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
