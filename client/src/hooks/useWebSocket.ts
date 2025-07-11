import { useEffect, useRef, useState } from "react";

interface UseWebSocketProps {
  onMessage: (data: any) => void;
  onError: (error: Error) => void;
}

export function useWebSocket({ onMessage, onError }: UseWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connect = () => {
      try {
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          setIsConnected(true);
          console.log("WebSocket connected");
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        wsRef.current.onclose = () => {
          setIsConnected(false);
          console.log("WebSocket disconnected");
          // Attempt to reconnect after 3 seconds
          setTimeout(connect, 3000);
        };

        wsRef.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          onError(new Error("WebSocket connection failed"));
        };
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error);
        onError(new Error("Failed to create WebSocket connection"));
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [onMessage, onError]);

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  };

  return { sendMessage, isConnected };
}
