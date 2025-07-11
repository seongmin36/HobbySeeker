// Firebase messaging service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase
const firebaseConfig = {
  apiKey: "mock-api-key",
  authDomain: "hobbyconnect-mock.firebaseapp.com",
  projectId: "hobbyconnect-mock",
  storageBucket: "hobbyconnect-mock.appspot.com",
  messagingSenderId: "123456789",
  appId: "mock-app-id"
};

firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || '🔥 번개 모임 알림';
  const notificationOptions = {
    body: payload.notification?.body || '내 주변에 새로운 번개 모임이 생겼어요!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data || {},
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: '모임 보기'
      },
      {
        action: 'dismiss',
        title: '닫기'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the app with the specific meetup
    const meetupId = event.notification.data?.meetupId;
    const url = meetupId ? `/lightning-meetups?meetup=${meetupId}` : '/lightning-meetups';
    
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});