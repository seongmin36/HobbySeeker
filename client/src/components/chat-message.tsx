import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface ChatMessageProps {
  message: any;
  isOwn: boolean;
}

export default function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const timeAgo = formatDistanceToNow(new Date(message.createdAt), { 
    addSuffix: true,
    locale: ko 
  });

  return (
    <div className={`flex items-start space-x-3 ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}>
      <div className="flex-shrink-0">
        <img 
          src={`https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32`}
          alt="User avatar" 
          className="w-8 h-8 rounded-full object-cover"
        />
      </div>
      <div className={`flex-1 ${isOwn ? "text-right" : ""}`}>
        <div className={`flex items-center space-x-2 ${isOwn ? "justify-end" : ""}`}>
          <span className="text-sm font-medium text-gray-900">
            {isOwn ? "나" : `사용자 ${message.userId.slice(-4)}`}
          </span>
          <span className="text-xs text-gray-500">{timeAgo}</span>
        </div>
        <div className={`mt-1 ${isOwn ? "text-right" : ""}`}>
          <div className={`inline-block rounded-lg p-3 max-w-xs lg:max-w-md ${
            isOwn 
              ? "bg-primary text-white" 
              : "bg-gray-100 text-gray-800"
          }`}>
            <p className="text-sm">{message.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
