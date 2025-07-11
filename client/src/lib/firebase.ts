// Firebase configuration for push notifications
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hobbyconnect-mock.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hobbyconnect-mock",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hobbyconnect-mock.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "mock-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging: any = null;

export const initializeFirebaseMessaging = async () => {
  try {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      messaging = getMessaging(app);
      return messaging;
    }
  } catch (error) {
    console.log('Firebase messaging not available:', error);
  }
  return null;
};

export const requestNotificationPermission = async () => {
  try {
    if (!messaging) {
      await initializeFirebaseMessaging();
    }
    
    if (!messaging) {
      console.log('Firebase messaging not initialized');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || 'mock-vapid-key'
      });
      
      if (token) {
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('No registration token available');
        return null;
      }
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

export const onMessageListener = () => {
  if (!messaging) {
    console.log('Firebase messaging not initialized');
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      resolve(payload);
    });
  });
};

export const registerFcmToken = async (token: string) => {
  try {
    const response = await fetch('/api/fcm/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fcmToken: token }),
    });
    
    if (response.ok) {
      console.log('FCM token registered successfully');
      return true;
    } else {
      console.error('Failed to register FCM token');
      return false;
    }
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return false;
  }
};

export const showNotification = (title: string, body: string, data?: any) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data,
      requireInteraction: true
    });
  }
};