import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

  const { data: communities, isLoading } = useQuery({
    queryKey: ["/api/communities"],
    retry: false,
  });

  const filteredCommunities = communities?.filter((community: any) => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || community.category === selectedCategory;
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
                <SelectItem value="">전체 카테고리</SelectItem>
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
