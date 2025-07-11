import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import CommunityCard from "@/components/community-card";
import CommunityForm from "@/components/forms/community-form";
import { Plus, Search, Users, MapPin } from "lucide-react";

export default function Communities() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [location] = useLocation();

  // Get search parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(decodeURIComponent(searchParam));
    }
  }, [location]);

  const { data: communities, isLoading } = useQuery({
    queryKey: ["/api/communities"],
    retry: false,
  });

  const filteredCommunities = communities?.filter((community: any) => {
    if (!searchTerm && (!selectedCategory || selectedCategory === "all")) {
      return true;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const communityNameLower = community.name.toLowerCase();
    const communityDescLower = community.description?.toLowerCase() || '';
    
    const matchesSearch = !searchTerm || 
                         communityNameLower.includes(searchLower) ||
                         communityDescLower.includes(searchLower) ||
                         // Match specific hobby keywords with community topics
                         (searchLower.includes('마법사') && (communityNameLower.includes('플래시몹') || communityNameLower.includes('퍼포먼스'))) ||
                         (searchLower.includes('k-팝') && (communityNameLower.includes('k-팝') || communityNameLower.includes('댄스'))) ||
                         (searchLower.includes('아이돌') && (communityNameLower.includes('k-팝') || communityNameLower.includes('댄스'))) ||
                         (searchLower.includes('미니어처') && (communityNameLower.includes('미니어처') || communityNameLower.includes('공방'))) ||
                         (searchLower.includes('디지털') && (communityNameLower.includes('개발자') || communityNameLower.includes('3d') || communityNameLower.includes('디지털'))) ||
                         (searchLower.includes('건축가') && (communityNameLower.includes('개발자') || communityNameLower.includes('3d') || communityNameLower.includes('프린팅'))) ||
                         (searchLower.includes('캐릭터') && (communityNameLower.includes('코스프레') || communityNameLower.includes('코스튬'))) ||
                         (searchLower.includes('춤신춤왕') && (communityNameLower.includes('댄스') || communityNameLower.includes('코스프레'))) ||
                         (searchLower.includes('연금술사') && (communityNameLower.includes('코스튬') || communityNameLower.includes('분자') || communityNameLower.includes('요리'))) ||
                         (searchLower.includes('미식') && (communityNameLower.includes('분자') || communityNameLower.includes('요리'))) ||
                         (searchLower.includes('별빛') && (communityNameLower.includes('천문대') || communityNameLower.includes('망원경'))) ||
                         (searchLower.includes('광학') && (communityNameLower.includes('천문대') || communityNameLower.includes('망원경'))) ||
                         // General keyword matching
                         (searchLower.includes('침묵') && communityNameLower.includes('명상')) ||
                         (searchLower.includes('요가') && communityNameLower.includes('요가')) ||
                         (searchLower.includes('코딩') && communityNameLower.includes('코딩')) ||
                         (searchLower.includes('프로그래밍') && communityNameLower.includes('코딩')) ||
                         (searchLower.includes('독서') && communityNameLower.includes('독서')) ||
                         (searchLower.includes('책') && communityNameLower.includes('독서')) ||
                         (searchLower.includes('음악') && communityNameLower.includes('음악')) ||
                         (searchLower.includes('악기') && communityNameLower.includes('음악')) ||
                         (searchLower.includes('운동') && communityNameLower.includes('운동')) ||
                         (searchLower.includes('헬스') && communityNameLower.includes('헬스')) ||
                         (searchLower.includes('요리') && communityNameLower.includes('요리')) ||
                         (searchLower.includes('쿠킹') && communityNameLower.includes('요리')) ||
                         (searchLower.includes('그림') && communityNameLower.includes('그림')) ||
                         (searchLower.includes('미술') && communityNameLower.includes('미술')) ||
                         (searchLower.includes('사진') && communityNameLower.includes('사진')) ||
                         (searchLower.includes('포토') && communityNameLower.includes('사진'));
    
    const matchesCategory = !selectedCategory || selectedCategory === "all" || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "art", label: "예술/창작" },
    { value: "music", label: "음악" },
    { value: "sports", label: "스포츠" },
    { value: "culture", label: "문화/교양" },
    { value: "cooking", label: "요리/제과" },
    { value: "tech", label: "IT/기술" },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 mr-3" />
            동호회 탐색
          </h1>
          <p className="text-gray-600 mt-2">새로운 취미 친구들과 함께하세요</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          새 동호회 만들기
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            검색 및 필터
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="동호회 이름 또는 설명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Community Form Modal */}
      {showCreateForm && (
        <CommunityForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            // Refresh communities list
            window.location.reload();
          }}
        />
      )}

      {/* Search Results Header */}
      {searchTerm && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-1">
            "{searchTerm}" 관련 동호회 검색 결과
          </h3>
          <p className="text-blue-700 text-sm">
            {filteredCommunities?.length || 0}개의 관련 동호회를 찾았습니다.
          </p>
        </div>
      )}

      {/* Communities Grid */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {filteredCommunities?.length || 0}개의 동호회
        </h2>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm text-gray-600">서울 강남구 기준</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : filteredCommunities && filteredCommunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community: any) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedCategory ? "검색 결과가 없습니다" : "아직 동호회가 없습니다"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory 
              ? "다른 검색어나 카테고리로 시도해보세요" 
              : "첫 번째 동호회를 만들어보세요"}
          </p>
          {(!searchTerm && !selectedCategory) && (
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              동호회 만들기
            </Button>
          )}
        </div>
      )}
    </main>
  );
}
