import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useWebSocket } from "@/hooks/useWebSocket";
import ChatMessage from "@/components/chat-message";
import { Send, Paperclip, Users } from "lucide-react";

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const communityId = parseInt(id || "0");

  const { data: community, isLoading: communityLoading } = useQuery({
    queryKey: ["/api/communities", communityId],
    retry: false,
  });

  const { data: initialMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/communities", communityId, "messages"],
    retry: false,
  });

  const { sendMessage, isConnected } = useWebSocket({
    onMessage: (data) => {
      if (data.type === 'chat' && data.message.communityId === communityId) {
        setMessages(prev => [...prev, data.message]);
      }
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
        title: "연결 오류",
        description: "채팅 서버 연결에 문제가 있습니다.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || !isConnected) return;

    sendMessage({
      type: 'chat',
      communityId,
      content: message,
      userId: user.id,
    });

    setMessage("");
  };

  if (communityLoading || messagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">동호회를 찾을 수 없습니다</h2>
          <p className="text-gray-600">존재하지 않는 동호회이거나 접근 권한이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="h-[calc(100vh-200px)] flex flex-col">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{community.name}</h1>
              <p className="text-sm text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {community.currentMembers}명이 참여중
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">아직 메시지가 없습니다.</p>
              <p className="text-sm text-gray-500">첫 번째 메시지를 보내보세요!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                isOwn={msg.userId === user?.id}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1"
              disabled={!isConnected}
            />
            <Button 
              type="submit" 
              disabled={!message.trim() || !isConnected}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {!isConnected && (
            <p className="text-xs text-red-500 mt-2">채팅 서버에 연결되지 않았습니다.</p>
          )}
        </div>
      </Card>
    </main>
  );
}
