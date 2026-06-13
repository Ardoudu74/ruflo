import * as Location from 'expo-location';
import { Story } from '../types/story';
import { Venue } from '../types';

const GEO_RADIUS_M = 300;

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function verifyUserAtVenue(venue: Venue): Promise<{ verified: boolean; distanceM: number }> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return { verified: false, distanceM: -1 };
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  const distanceM = haversineM(pos.coords.latitude, pos.coords.longitude, venue.latitude, venue.longitude);
  return { verified: distanceM <= GEO_RADIUS_M, distanceM: Math.round(distanceM) };
}

export function nextSixAM(): number {
  const now = new Date();
  const next = new Date(now);
  if (now.getHours() >= 6) {
    next.setDate(next.getDate() + 1);
  }
  next.setHours(6, 0, 0, 0);
  return next.getTime();
}

export function buildStory(
  uid: string,
  displayName: string,
  venue: Venue,
  videoUri: string,
  caption: string,
  lat: number,
  lng: number,
  geoVerified: boolean,
): Story {
  return {
    id: `story_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    venueId: venue.id,
    venueName: venue.name,
    city: venue.city,
    uid,
    displayName,
    videoUri,
    caption: caption.slice(0, 120),
    createdAt: Date.now(),
    expiresAt: nextSixAM(),
    lat,
    lng,
    geoVerified,
    status: 'active',
    reportCount: 0,
    views: 0,
  };
}

export function containsProfanity(text: string): boolean {
  const banned = ['fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'nigger', 'faggot'];
  return banned.some(w => new RegExp(`\\b${w}\\b`, 'i').test(text));
}
