import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import UserProfileForm from "@/components/forms/user-profile-form";
import RecommendationCard from "@/components/recommendation-card";
import CommunityCard from "@/components/community-card";
import { MapPin, Sparkles, Users } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const [showProfileForm, setShowProfileForm] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: communities, isLoading: communitiesLoading } = useQuery({
    queryKey: ["/api/communities/nearby"],
    retry: false,
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/recommendations"],
    retry: false,
  });

  const generateRecommendations = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/recommendations");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      toast({
        title: "추천 완료",
        description: "AI가 분석한 맞춤 취미 추천이 생성되었습니다.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "오류",
        description: "추천 생성에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const hasCompleteProfile = user?.gender && user?.age && user?.mbti;

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          안녕하세요, {user?.firstName || "사용자"}님!
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          AI가 분석한 맞춤형 취미 추천과 함께하는 커뮤니티
        </p>
        <div className="flex justify-center space-x-4">
          {!hasCompleteProfile ? (
            <Button 
              onClick={() => setShowProfileForm(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              프로필 완성하기
            </Button>
          ) : (
            <Button 
              onClick={() => generateRecommendations.mutate()}
              disabled={generateRecommendations.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {generateRecommendations.isPending ? "추천 생성 중..." : "새로운 취미 추천 받기"}
            </Button>
          )}
        </div>
      </section>

      {/* Profile Form Modal */}
      {showProfileForm && (
        <UserProfileForm
          user={user}
          onClose={() => setShowProfileForm(false)}
          onSuccess={() => {
            setShowProfileForm(false);
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          }}
        />
      )}

      {/* AI Recommendations */}
      {hasCompleteProfile && (
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                AI 맞춤 취미 추천
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendationsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Skeleton className="h-48" />
                  <Skeleton className="h-48" />
                </div>
              ) : recommendations && recommendations.length > 0 ? (
                <div className="space-y-8">
                  {/* 초심자 단계 추천 */}
                  {recommendations.filter((rec: any) => 
                    rec.skillLevel === "호기심단계" || rec.skillLevel === "취미탐험"
                  ).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm mr-2">
                          🌱 초심자 단계
                        </span>
                        부담없이 시작할 수 있는 취미
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations
                          .filter((rec: any) => rec.skillLevel === "호기심단계" || rec.skillLevel === "취미탐험")
                          .map((rec: any) => (
                            <RecommendationCard key={rec.id} recommendation={rec} />
                          ))}
                      </div>
                    </div>
                  )}

                  {/* 중급 단계 추천 */}
                  {recommendations.filter((rec: any) => 
                    rec.skillLevel === "실력향상" || rec.skillLevel === "열정폭발"
                  ).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm mr-2">
                          🔥 중급 단계
                        </span>
                        깊이 있게 즐길 수 있는 취미
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations
                          .filter((rec: any) => rec.skillLevel === "실력향상" || rec.skillLevel === "열정폭발")
                          .map((rec: any) => (
                            <RecommendationCard key={rec.id} recommendation={rec} />
                          ))}
                      </div>
                    </div>
                  )}

                  {/* 고급 단계 추천 */}
                  {recommendations.filter((rec: any) => 
                    rec.skillLevel === "준전문가" || rec.skillLevel === "마스터급" || rec.skillLevel === "전설급"
                  ).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm mr-2">
                          💎 고급 단계
                        </span>
                        전문성을 키울 수 있는 취미
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations
                          .filter((rec: any) => rec.skillLevel === "준전문가" || rec.skillLevel === "마스터급" || rec.skillLevel === "전설급")
                          .map((rec: any) => (
                            <RecommendationCard key={rec.id} recommendation={rec} />
                          ))}
                      </div>
                    </div>
                  )}

                  {/* 기타 취미 (단계 분류 안된 것들) */}
                  {recommendations.filter((rec: any) => 
                    !["호기심단계", "취미탐험", "실력향상", "열정폭발", "준전문가", "마스터급", "전설급"].includes(rec.skillLevel)
                  ).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm mr-2">
                          ✨ 특별한 취미
                        </span>
                        독특하고 재미있는 취미
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations
                          .filter((rec: any) => !["호기심단계", "취미탐험", "실력향상", "열정폭발", "준전문가", "마스터급", "전설급"].includes(rec.skillLevel))
                          .map((rec: any) => (
                            <RecommendationCard key={rec.id} recommendation={rec} />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">아직 추천받은 취미가 없습니다.</p>
                  <Button 
                    onClick={() => generateRecommendations.mutate()}
                    disabled={generateRecommendations.isPending}
                  >
                    첫 번째 추천 받기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Community Discovery */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            내 주변 동호회
          </h3>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm text-gray-600">
              {user?.location || "위치 정보 없음"}
            </span>
          </div>
        </div>
        
        {communitiesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : communities && communities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.slice(0, 6).map((community: any) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">주변에 동호회가 없습니다.</p>
          </div>
        )}
      </section>
    </main>
  );
}
