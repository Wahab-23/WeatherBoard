import { useState, useCallback } from 'react';
import { safeStorage } from '../services/safeStorage';

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

const NOTIFICATIONS_ENABLED_KEY = 'weatherboard_notifications_enabled';
const NOTIFICATION_TIME_KEY = 'weatherboard_notification_time';

export function useNotifications() {
  const [isSupported] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window;
  });
  const [permission, setPermission] = useState<NotificationPermissionState>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission as NotificationPermissionState;
    }
    return 'unsupported';
  });
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    return safeStorage.getItem(NOTIFICATIONS_ENABLED_KEY) === 'true';
  });
  const [reminderTime, setReminderTime] = useState<string>(() => {
    return safeStorage.getItem(NOTIFICATION_TIME_KEY) || '08:00';
  });
  const [testSent, setTestSent] = useState<boolean>(false);

  const requestPermission = useCallback(async (): Promise<NotificationPermissionState> => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return 'unsupported';
    }

    try {
      const result = await Notification.requestPermission();
      const state = result as NotificationPermissionState;
      setPermission(state);

      if (state === 'granted') {
        setIsEnabled(true);
        safeStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
      } else {
        setIsEnabled(false);
        safeStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'false');
      }

      return state;
    } catch (err) {
      console.warn('[Notifications] Permission request error:', err);
      return permission;
    }
  }, [permission]);

  const updateReminderTime = useCallback((time: string) => {
    setReminderTime(time);
    safeStorage.setItem(NOTIFICATION_TIME_KEY, time);
  }, []);

  const disableNotifications = useCallback(() => {
    setIsEnabled(false);
    safeStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'false');
  }, []);

  const sendTestNotification = useCallback(async (cityName?: string, temp?: string, condition?: string) => {
    if (permission !== 'granted') return false;

    const title = `WeatherBoard Morning Forecast`;
    const body = cityName
      ? `${cityName}: ${temp || '21°C'}, ${condition || 'Clear sky'}. Have a productive day ahead!`
      : 'Your daily meteorological briefing is prepared. Clear atmospheric conditions detected.';

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'TRIGGER_TEST_NOTIFICATION',
        title,
        body,
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
      return true;
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/favicon.svg',
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
      return true;
    }
    return false;
  }, [permission]);

  return {
    isSupported,
    permission,
    isEnabled: isEnabled && permission === 'granted',
    reminderTime,
    testSent,
    requestPermission,
    disableNotifications,
    updateReminderTime,
    sendTestNotification,
  };
}
