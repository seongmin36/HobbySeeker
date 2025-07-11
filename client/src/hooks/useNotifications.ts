import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { 
  requestNotificationPermission, 
  registerFcmToken, 
  onMessageListener, 
  showNotification 
} from '@/lib/firebase';

export function useNotifications() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const initializeNotifications = async () => {
      if (!isAuthenticated) return;

      try {
        const token = await requestNotificationPermission();
        if (token) {
          setHasPermission(true);
          await registerFcmToken(token);
          console.log('📱 FCM 알림이 활성화되었습니다');
        }
      } catch (error) {
        console.log('알림 초기화 중 오류:', error);
      }
      
      setIsInitialized(true);
    };

    initializeNotifications();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!hasPermission) return;

    const setupMessageListener = async () => {
      try {
        onMessageListener().then((payload: any) => {
          console.log('새로운 알림:', payload);
          
          if (payload.notification) {
            showNotification(
              payload.notification.title || '새로운 알림',
              payload.notification.body || '',
              payload.data
            );
          }
        });
      } catch (error) {
        console.log('메시지 리스너 설정 중 오류:', error);
      }
    };

    setupMessageListener();
  }, [hasPermission]);

  return {
    isInitialized,
    hasPermission
  };
}