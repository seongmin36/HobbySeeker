import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Sparkles, Users, ChevronDown, ChevronUp } from "lucide-react";

interface RecommendationCardProps {
  recommendation: any;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export default function RecommendationCard({ 
  recommendation, 
  isExpanded = false, 
  onToggle 
}: RecommendationCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900">{recommendation.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {recommendation.recommendationScore}% 매치
              </Badge>
              {onToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="p-1"
                >
                  {isExpanded ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </Button>
              )}
            </div>
          </div>
          {recommendation.skillLevel && (
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {recommendation.skillLevel}
              </Badge>
              {recommendation.estimatedCost && (
                <span className="text-xs text-gray-500">
                  💰 {recommendation.estimatedCost}
                </span>
              )}
              {recommendation.timeCommitment && (
                <span className="text-xs text-gray-500">
                  ⏰ {recommendation.timeCommitment}
                </span>
              )}
            </div>
          )}
        </div>
        
        {!isExpanded ? (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {recommendation.description}
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {recommendation.description}
            </p>
            
            {recommendation.reasons && recommendation.reasons.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">추천 이유:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {recommendation.reasons.map((reason: string, index: number) => (
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
                {recommendation.socialAspect && (
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {recommendation.socialAspect}
                  </span>
                )}
              </div>
              <Link href="/communities">
                <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                  <Users className="h-3 w-3 mr-1" />
                  동호회 찾기
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
