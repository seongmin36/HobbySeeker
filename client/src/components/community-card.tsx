import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Users, Calendar, MapPin, MessageCircle } from "lucide-react";

interface CommunityCardProps {
  community: any;
}

export default function CommunityCard({ community }: CommunityCardProps) {
  const { toast } = useToast();

  const joinCommunity = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/communities/${community.id}/join`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communities"] });
      toast({
        title: "가입 완료",
        description: `${community.name}에 성공적으로 가입했습니다.`,
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
        description: "동호회 가입에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      art: "예술/창작",
      music: "음악",
      sports: "스포츠",
      culture: "문화/교양",
      cooking: "요리/제과",
      tech: "IT/기술",
    };
    return categories[category] || category;
  };

  const getFrequencyLabel = (frequency: string) => {
    const frequencies: Record<string, string> = {
      weekly: "주 1회",
      biweekly: "격주",
      monthly: "월 1회",
      flexible: "유동적",
    };
    return frequencies[frequency] || frequency;
  };

  const isFullyBooked = community.currentMembers >= community.maxMembers;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <Badge variant="secondary">{getCategoryLabel(community.category)}</Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{community.name}</h3>
          {community.location && (
            <span className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {community.location}
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {community.description || "동호회 소개가 없습니다."}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {community.currentMembers}/{community.maxMembers}명
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {getFrequencyLabel(community.meetingFrequency)}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={() => joinCommunity.mutate()}
            disabled={joinCommunity.isPending || isFullyBooked}
          >
            {joinCommunity.isPending ? "가입 중..." : isFullyBooked ? "정원 마감" : "가입하기"}
          </Button>
          <Link href={`/chat/${community.id}`}>
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
