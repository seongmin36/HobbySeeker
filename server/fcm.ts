import admin from 'firebase-admin';
import { storage } from './storage';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // In production, you would use a service account key
  // For now, we'll use a mock implementation
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'hobbyconnect-mock',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'mock@hobbyconnect.iam.gserviceaccount.com',
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || 'mock-private-key'
      })
    });
  } catch (error) {
    console.log('Firebase Admin initialization skipped (mock mode)');
  }
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: string };
}

export async function sendPushNotification(
  fcmToken: string,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    // In mock mode, just log the notification
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.log('📱 Mock FCM Notification:', {
        token: fcmToken,
        title: payload.title,
        body: payload.body,
        data: payload.data
      });
      return true;
    }

    const message = {
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    };

    const response = await admin.messaging().send(message);
    console.log('FCM notification sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending FCM notification:', error);
    return false;
  }
}

export async function sendPushNotificationToMultiple(
  fcmTokens: string[],
  payload: PushNotificationPayload
): Promise<void> {
  try {
    // In mock mode, just log the notifications
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.log('📱 Mock FCM Notifications to multiple users:', {
        tokenCount: fcmTokens.length,
        title: payload.title,
        body: payload.body,
        data: payload.data
      });
      return;
    }

    const message = {
      tokens: fcmTokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log('FCM notifications sent:', response.successCount, 'successful,', response.failureCount, 'failed');
  } catch (error) {
    console.error('Error sending FCM notifications:', error);
  }
}

export async function notifyNearbyUsersOfLightningMeetup(
  meetupId: number,
  organizerLocation: string,
  meetupTitle: string,
  meetupTime: string
): Promise<void> {
  try {
    // Get users in the same district/area
    const nearbyUsers = await storage.getUsersInArea(organizerLocation);
    
    if (nearbyUsers.length === 0) {
      console.log('No nearby users found for lightning meetup notification');
      return;
    }

    const fcmTokens = nearbyUsers
      .filter(user => user.fcmToken)
      .map(user => user.fcmToken!);

    if (fcmTokens.length === 0) {
      console.log('No FCM tokens found for nearby users');
      return;
    }

    const payload: PushNotificationPayload = {
      title: '🔥 내 주변에 번개 모임이 생겼어요!',
      body: `${meetupTitle} - ${meetupTime}`,
      data: {
        type: 'lightning_meetup',
        meetupId: meetupId.toString(),
        location: organizerLocation
      }
    };

    await sendPushNotificationToMultiple(fcmTokens, payload);
    console.log(`Lightning meetup notification sent to ${fcmTokens.length} nearby users`);
  } catch (error) {
    console.error('Error notifying nearby users of lightning meetup:', error);
  }
}