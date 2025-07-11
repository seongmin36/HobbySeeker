import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { X } from "lucide-react";

const profileSchema = z.object({
  gender: z.string().optional(),
  age: z.number().min(1).max(120).optional(),
  mbti: z.string().optional(),
  budget: z.string().optional(),
  timeAvailability: z.string().optional(),
  networkingPreference: z.boolean().default(false),
  uniqueHobbyPreference: z.boolean().default(false),
  blacklistedHobbies: z.array(z.string()).default([]),
  bio: z.string().optional(),
  location: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfileFormProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserProfileForm({ user, onClose, onSuccess }: UserProfileFormProps) {
  const { toast } = useToast();
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(user?.blacklistedHobbies || []);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      gender: user?.gender || "",
      age: user?.age || undefined,
      mbti: user?.mbti || "",
      budget: user?.budget || "",
      timeAvailability: user?.timeAvailability || "",
      networkingPreference: user?.networkingPreference || false,
      uniqueHobbyPreference: user?.uniqueHobbyPreference || false,
      blacklistedHobbies: user?.blacklistedHobbies || [],
      bio: user?.bio || "",
      location: user?.location || "",
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const res = await apiRequest("PATCH", "/api/users/profile", data);
      return res.json();
    },
    onSuccess: () => {
      onSuccess();
      toast({
        title: "프로필 업데이트",
        description: "프로필이 성공적으로 업데이트되었습니다.",
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
        description: "프로필 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const mbtiOptions = [
    "INTJ", "INTP", "ENTJ", "ENTP",
    "INFJ", "INFP", "ENFJ", "ENFP",
    "ISTJ", "ISFJ", "ESTJ", "ESFJ",
    "ISTP", "ISFP", "ESTP", "ESFP"
  ];

  const hobbyOptions = [
    "운동", "요리", "독서", "음악", "게임", "영화감상",
    "여행", "사진", "그림", "춤", "노래", "악기연주"
  ];

  const handleHobbyToggle = (hobby: string) => {
    const newHobbies = selectedHobbies.includes(hobby)
      ? selectedHobbies.filter(h => h !== hobby)
      : [...selectedHobbies, hobby];
    setSelectedHobbies(newHobbies);
    form.setValue("blacklistedHobbies", newHobbies);
  };

  const onSubmit = (data: ProfileFormData) => {
    updateProfile.mutate({ ...data, blacklistedHobbies: selectedHobbies });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>프로필 설정</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="gender">성별</Label>
                <Select value={form.watch("gender")} onValueChange={(value) => form.setValue("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">남성</SelectItem>
                    <SelectItem value="female">여성</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="age">나이</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="만 나이를 입력하세요"
                  {...form.register("age", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="mbti">MBTI</Label>
                <Select value={form.watch("mbti")} onValueChange={(value) => form.setValue("mbti", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {mbtiOptions.map((mbti) => (
                      <SelectItem key={mbti} value={mbti}>
                        {mbti}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budget">월 예산</Label>
                <Select value={form.watch("budget")} onValueChange={(value) => form.setValue("budget", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-50">5만원 미만</SelectItem>
                    <SelectItem value="50-100">5만원 - 10만원</SelectItem>
                    <SelectItem value="100-200">10만원 - 20만원</SelectItem>
                    <SelectItem value="over-200">20만원 이상</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>블랙리스트 취미</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {hobbyOptions.map((hobby) => (
                  <div key={hobby} className="flex items-center space-x-2">
                    <Checkbox
                      id={hobby}
                      checked={selectedHobbies.includes(hobby)}
                      onCheckedChange={() => handleHobbyToggle(hobby)}
                    />
                    <Label htmlFor={hobby} className="text-sm">{hobby}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>취미에 할애할 수 있는 시간</Label>
              <Select value={form.watch("timeAvailability")} onValueChange={(value) => form.setValue("timeAvailability", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-2">주 1-2회</SelectItem>
                  <SelectItem value="3-4">주 3-4회</SelectItem>
                  <SelectItem value="daily">거의 매일</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="networking"
                  checked={form.watch("networkingPreference")}
                  onCheckedChange={(checked) => form.setValue("networkingPreference", !!checked)}
                />
                <Label htmlFor="networking">네트워킹 선호</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unique"
                  checked={form.watch("uniqueHobbyPreference")}
                  onCheckedChange={(checked) => form.setValue("uniqueHobbyPreference", !!checked)}
                />
                <Label htmlFor="unique">이색 취미 선호</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="bio">자기소개</Label>
              <Textarea
                id="bio"
                placeholder="자신을 소개해주세요..."
                {...form.register("bio")}
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
                disabled={updateProfile.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {updateProfile.isPending ? "저장 중..." : "저장하기"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
