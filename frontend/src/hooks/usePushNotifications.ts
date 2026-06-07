import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { subscribePush, type NotificationPreference } from '../features/pushSlice';

const urlBase64ToUint8Array = (base64String: string): Uint8Array<ArrayBuffer> => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length) as Uint8Array<ArrayBuffer>;
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export type PushSubscribeResult = { ok: true } | { ok: false; message: string };

export function usePushNotifications() {
  const dispatch = useAppDispatch();

  const ensurePushSubscription = useCallback(
    async (vapidPublicKey: string | null): Promise<PushSubscribeResult> => {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        return { ok: false, message: 'Push notifications are not supported in this browser.' };
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { ok: false, message: 'Notification permission was denied.' };
      }

      if (!vapidPublicKey) {
        return { ok: false, message: 'Push is not configured on the server.' };
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
      }

      await dispatch(subscribePush(subscription.toJSON())).unwrap();
      return { ok: true };
    },
    [dispatch]
  );

  const subscribeIfEnabled = useCallback(
    async (
      preferences: NotificationPreference,
      vapidPublicKey: string | null
    ): Promise<PushSubscribeResult | null> => {
      if (!preferences.pushEnabled) {
        return null;
      }
      return ensurePushSubscription(vapidPublicKey);
    },
    [ensurePushSubscription]
  );

  return { ensurePushSubscription, subscribeIfEnabled };
}
