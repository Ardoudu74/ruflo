/**
 * Safe Night service.
 * SMS calls MUST go through your backend (Firebase Cloud Function).
 * NEVER expose Twilio credentials client-side.
 */

import * as Location from 'expo-location';
import { Linking, Alert } from 'react-native';
import { useSafeNightStore } from '../store/useSafeNightStore';
import { useAuthStore } from '../store/useAuthStore';

let locationSubscription: Location.LocationSubscription | null = null;

export async function startLocationSharing(): Promise<boolean> {
  const store = useSafeNightStore.getState();
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    store.setLocError('Location permission denied');
    return false;
  }

  const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
  if (bgStatus !== 'granted') {
    store.setLocError('Background location needed for Safe Night');
  }

  locationSubscription = await Location.watchPositionAsync(
    { accuracy: Location.Accuracy.High, distanceInterval: 50, timeInterval: 30_000 },
    (loc) => {
      store.setLocation(loc.coords.latitude, loc.coords.longitude);
      sendLocationToContact(loc.coords.latitude, loc.coords.longitude);
    }
  );

  store.enable();
  scheduleAutoDisable();
  return true;
}

export function stopLocationSharing(): void {
  locationSubscription?.remove();
  locationSubscription = null;
  useSafeNightStore.getState().disable();
}

function scheduleAutoDisable(): void {
  const now  = new Date();
  const next = new Date();
  next.setHours(6, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const ms = next.getTime() - now.getTime();
  setTimeout(() => stopLocationSharing(), ms);
}

async function sendLocationToContact(lat: number, lng: number): Promise<void> {
  const profile = useAuthStore.getState().profile;
  const contact = profile?.emergencyContact;
  if (!contact) return;
  const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
  const body    = `[NightOut Safe Night] ${profile.displayName} is here: ${mapsUrl}`;
  // Production: POST to your Firebase Function /api/sms
  console.log('[SafeNight SMS stub]', contact.phone, body);
}

export async function triggerSOS(): Promise<void> {
  const store   = useSafeNightStore.getState();
  const profile = useAuthStore.getState().profile;
  const contact = profile?.emergencyContact;
  const lat     = store.currentLat;
  const lng     = store.currentLng;

  store.triggerSOS();

  if (contact) {
    const mapsUrl = lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : '(location unavailable)';
    const body    = `🆘 SOS from ${profile?.displayName ?? 'NightOut user'} — ${mapsUrl}`;
    console.log('[SOS SMS stub]', contact.phone, body);
  }

  Alert.alert(
    '⚡ SOS Sent',
    `Message sent to ${contact?.name ?? 'your emergency contact'}.\n\nCall emergency services?`,
    [
      { text: 'Call 112 (EU)', onPress: () => Linking.openURL('tel:112') },
      { text: 'Call 911 (US)', onPress: () => Linking.openURL('tel:911') },
      { text: 'Cancel', style: 'cancel', onPress: () => store.resetSOS() },
    ]
  );
}
