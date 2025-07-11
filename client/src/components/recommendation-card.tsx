import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Sparkles, Users } from "lucide-react";

interface RecommendationCardProps {
  recommendation: any;
}

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{recommendation.hobbyName}</h3>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {recommendation.recommendationScore}% 매치
          </Badge>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {recommendation.description}
        </p>
        
        {recommendation.reasons && recommendation.reasons.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">추천 이유:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {recommendation.reasons.slice(0, 2).map((reason: string, index: number) => (
                <li key={index} className="flex items-start">
                  <Sparkles className="h-3 w-3 mr-1 mt-0.5 text-primary flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            추천도: {recommendation.recommendationScore}%
          </div>
          <Link href="/communities">
            <Button size="sm" className="bg-secondary hover:bg-secondary/90">
              <Users className="h-3 w-3 mr-1" />
              동호회 찾기
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
