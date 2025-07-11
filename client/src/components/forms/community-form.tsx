import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { X } from "lucide-react";

const communitySchema = z.object({
  name: z.string().min(1, "동호회 이름을 입력해주세요"),
  description: z.string().optional(),
  category: z.string().min(1, "카테고리를 선택해주세요"),
  maxMembers: z.number().min(2, "최소 2명 이상").max(100, "최대 100명까지"),
  meetingFrequency: z.string().min(1, "모임 주기를 선택해주세요"),
  openChatLink: z.string().optional(),
  location: z.string().optional(),
});

type CommunityFormData = z.infer<typeof communitySchema>;

interface CommunityFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CommunityForm({ onClose, onSuccess }: CommunityFormProps) {
  const { toast } = useToast();

  const form = useForm<CommunityFormData>({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      name: "",
      description: "",
      category: undefined,
      maxMembers: 10,
      meetingFrequency: undefined,
      openChatLink: "",
      location: "",
    },
  });

  const createCommunity = useMutation({
    mutationFn: async (data: CommunityFormData) => {
      const res = await apiRequest("POST", "/api/communities", data);
      return res.json();
    },
    onSuccess: () => {
      onSuccess();
      toast({
        title: "동호회 생성",
        description: "새로운 동호회가 성공적으로 생성되었습니다.",
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
        description: "동호회 생성에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const categories = [
    { value: "art", label: "예술/창작" },
    { value: "music", label: "음악" },
    { value: "sports", label: "스포츠" },
    { value: "culture", label: "문화/교양" },
    { value: "cooking", label: "요리/제과" },
    { value: "tech", label: "IT/기술" },
  ];

  const frequencies = [
    { value: "weekly", label: "주 1회" },
    { value: "biweekly", label: "격주" },
    { value: "monthly", label: "월 1회" },
    { value: "flexible", label: "유동적" },
  ];

  const onSubmit = (data: CommunityFormData) => {
    createCommunity.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>새 동호회 만들기</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">동호회 이름 *</Label>
                <Input
                  id="name"
                  placeholder="동호회 이름을 입력하세요"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">카테고리 *</Label>
                <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.category.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="maxMembers">최대 인원 *</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="2"
                  max="100"
                  placeholder="최대 인원 수"
                  {...form.register("maxMembers", { valueAsNumber: true })}
                />
                {form.formState.errors.maxMembers && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.maxMembers.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="meetingFrequency">모임 주기 *</Label>
                <Select value={form.watch("meetingFrequency")} onValueChange={(value) => form.setValue("meetingFrequency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="주기 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.meetingFrequency && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.meetingFrequency.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">동호회 소개</Label>
              <Textarea
                id="description"
                placeholder="동호회에 대해 소개해주세요..."
                {...form.register("description")}
              />
            </div>

            <div>
              <Label htmlFor="openChatLink">오픈카톡 링크 (선택사항)</Label>
              <Input
                id="openChatLink"
                type="url"
                placeholder="https://open.kakao.com/..."
                {...form.register("openChatLink")}
              />
            </div>

            <div>
              <Label htmlFor="location">활동 지역</Label>
              <Input
                id="location"
                placeholder="예: 서울시 강남구"
                {...form.register("location")}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button 
                type="submit" 
                disabled={createCommunity.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {createCommunity.isPending ? "생성 중..." : "동호회 만들기"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
