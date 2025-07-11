import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertLightningMeetupSchema, type InsertLightningMeetup } from "@shared/schema";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar, Clock, MapPin, Users, Zap, Plus } from "lucide-react";

export default function LightningMeetups() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: meetups, isLoading } = useQuery({
    queryKey: ["/api/lightning-meetups"],
    retry: false,
  });

  const form = useForm<InsertLightningMeetup>({
    resolver: zodResolver(insertLightningMeetupSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      meetingTime: "",
      maxParticipants: 4,
    },
  });

  const createMeetup = useMutation({
    mutationFn: async (data: InsertLightningMeetup) => {
      const res = await apiRequest("POST", "/api/lightning-meetups", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lightning-meetups"] });
      setShowCreateDialog(false);
      form.reset();
      toast({
        title: "번개 모임 생성 완료",
        description: "새로운 번개 모임이 생성되었습니다.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "인증 오류",
          description: "다시 로그인해주세요.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "오류",
        description: "번개 모임 생성에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const joinMeetup = useMutation({
    mutationFn: async (meetupId: number) => {
      const res = await apiRequest("POST", `/api/lightning-meetups/${meetupId}/join`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lightning-meetups"] });
      toast({
        title: "참가 완료",
        description: "번개 모임에 참가했습니다.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "인증 오류",
          description: "다시 로그인해주세요.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "오류",
        description: "번개 모임 참가에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertLightningMeetup) => {
    createMeetup.mutate(data);
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      "art": "bg-purple-100 text-purple-800",
      "music": "bg-blue-100 text-blue-800",
      "sports": "bg-green-100 text-green-800",
      "culture": "bg-yellow-100 text-yellow-800",
      "cooking": "bg-orange-100 text-orange-800",
      "tech": "bg-red-100 text-red-800",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getCategoryName = (category: string) => {
    const names = {
      "art": "예술",
      "music": "음악",
      "sports": "스포츠",
      "culture": "문화",
      "cooking": "요리",
      "tech": "기술",
    };
    return names[category as keyof typeof names] || category;
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Zap className="h-8 w-8 mr-3 text-yellow-500" />
            번개 모임
          </h1>
          <p className="text-gray-600 mt-2">즉석에서 만나는 특별한 모임</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              번개 모임 만들기
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>새 번개 모임 만들기</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>모임 제목</FormLabel>
                      <FormControl>
                        <Input placeholder="오늘 오후 카페에서 책 읽기" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>모임 설명</FormLabel>
                      <FormControl>
                        <Textarea placeholder="어떤 모임인지 자세히 알려주세요..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>카테고리</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="카테고리를 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="art">예술</SelectItem>
                          <SelectItem value="music">음악</SelectItem>
                          <SelectItem value="sports">스포츠</SelectItem>
                          <SelectItem value="culture">문화</SelectItem>
                          <SelectItem value="cooking">요리</SelectItem>
                          <SelectItem value="tech">기술</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>만날 장소</FormLabel>
                      <FormControl>
                        <Input placeholder="서울시 강남구 신사동 카페" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meetingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>모임 시간</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>최대 참가자 수</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="2" 
                          max="20" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        번개 모임은 소규모로 진행됩니다 (2-20명)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                  >
                    취소
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMeetup.isPending}
                  >
                    {createMeetup.isPending ? "생성 중..." : "모임 만들기"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : meetups && meetups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetups.map((meetup: any) => (
            <Card key={meetup.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold line-clamp-2">
                      {meetup.title}
                    </CardTitle>
                    <Badge className={`mt-2 ${getCategoryBadge(meetup.category)}`}>
                      {getCategoryName(meetup.category)}
                    </Badge>
                  </div>
                  <Zap className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {meetup.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(new Date(meetup.meetingTime), "MM월 dd일 (EEE)", { locale: ko })}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    {format(new Date(meetup.meetingTime), "HH:mm")}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    {meetup.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    {meetup.currentParticipants}/{meetup.maxParticipants}명
                  </div>
                </div>
                
                <div className="pt-3">
                  <Button
                    className="w-full"
                    onClick={() => joinMeetup.mutate(meetup.id)}
                    disabled={joinMeetup.isPending || meetup.currentParticipants >= meetup.maxParticipants}
                  >
                    {meetup.currentParticipants >= meetup.maxParticipants ? "마감됨" : "참가하기"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            아직 번개 모임이 없어요
          </h3>
          <p className="text-gray-600 mb-6">
            첫 번째 번개 모임을 만들어보세요!
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            번개 모임 만들기
          </Button>
        </div>
      )}
    </main>
  );
}