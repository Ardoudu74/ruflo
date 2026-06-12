/**
 * Push notifications — expo-notifications.
 * Add "expo-notifications" to package.json and configure in app.json:
 *   "plugins": [..., ["expo-notifications", { "icon": "./assets/notification-icon.png", "color": "#FFB800" }]]
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'NightOut',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFB800',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleTicketConfirmation(venueName: string, eventDate: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🎫 TICKET CONFIRMED',
      body: `${venueName} · ${new Date(eventDate).toLocaleDateString()}`,
      data: { type: 'ticket_confirmed' },
      color: '#FFB800',
    },
    trigger: null, // immediate
  });
}

export async function scheduleSafeNightReminder(): Promise<string> {
  const trigger = new Date();
  trigger.setHours(5, 45, 0, 0);
  if (trigger <= new Date()) trigger.setDate(trigger.getDate() + 1);

  return Notifications.scheduleNotificationAsync({
    content: {
      title: '🌙 SAFE NIGHT',
      body: 'Your location sharing will stop at 6AM. Tap to extend.',
      data: { type: 'safe_night_reminder' },
    },
    trigger,
  });
}

export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
