import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import UserProfileForm from "@/components/forms/user-profile-form";
import { queryClient } from "@/lib/queryClient";
import { User, Settings, Calendar, MapPin } from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const [showEditForm, setShowEditForm] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: userCommunities, isLoading: communitiesLoading } = useQuery({
    queryKey: ["/api/users/communities"],
    retry: false,
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/recommendations"],
    retry: false,
  });

  useEffect(() => {
    if (!userLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [user, userLoading, toast]);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img 
                src={user.profileImageUrl || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120`}
                alt="프로필 사진" 
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600 mt-1">{user.bio || "새로운 취미를 찾고 있는 사용자입니다."}</p>
              <div className="flex items-center space-x-4 mt-2">
                {user.mbti && (
                  <span className="text-sm text-gray-500">MBTI: {user.mbti}</span>
                )}
                {user.age && (
                  <span className="text-sm text-gray-500">나이: {user.age}세</span>
                )}
                {user.location && (
                  <span className="text-sm text-gray-500 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {user.location}
                  </span>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowEditForm(true)}
              className="flex items-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              프로필 수정
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form Modal */}
      {showEditForm && (
        <UserProfileForm
          user={user}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
            toast({
              title: "프로필 업데이트",
              description: "프로필이 성공적으로 업데이트되었습니다.",
            });
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Communities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              참여중인 동호회
            </CardTitle>
          </CardHeader>
          <CardContent>
            {communitiesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : userCommunities && userCommunities.length > 0 ? (
              <div className="space-y-2">
                {userCommunities.map((community: any) => (
                  <div key={community.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{community.name}</p>
                      <p className="text-sm text-gray-500">{community.category}</p>
                    </div>
                    <Badge variant={community.leaderId === user.id ? "default" : "secondary"}>
                      {community.leaderId === user.id ? "리더" : "멤버"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">참여중인 동호회가 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardHeader>
            <CardTitle>관심 분야</CardTitle>
          </CardHeader>
          <CardContent>
            {recommendationsLoading ? (
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
            ) : recommendations && recommendations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recommendations.slice(0, 5).map((rec: any) => (
                  <Badge key={rec.id} variant="outline">
                    {rec.hobbyName}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">아직 관심 분야가 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Stats */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>활동 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">{userCommunities?.length || 0}</div>
              <div className="text-sm text-gray-600">참여 동호회</div>
            </div>
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <div className="text-2xl font-bold text-secondary">{recommendations?.length || 0}</div>
              <div className="text-sm text-gray-600">추천받은 취미</div>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {userCommunities?.filter((c: any) => c.leaderId === user.id).length || 0}
              </div>
              <div className="text-sm text-gray-600">운영 동호회</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
