/**
 * Auth service — wraps Firebase Auth + Sign In with Apple.
 *
 * Real credentials must be set via environment variables:
 *   EXPO_PUBLIC_FIREBASE_API_KEY
 *   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
 *   EXPO_PUBLIC_FIREBASE_PROJECT_ID
 *
 * Install deps:
 *   npx expo install @react-native-firebase/app @react-native-firebase/auth expo-apple-authentication
 */

import { useAuthStore } from '../store/useAuthStore';
import type { UserProfile } from '../types/auth';

const DEFAULT_PROFILE = (uid: string, email?: string, name?: string): UserProfile => ({
  uid,
  displayName: name ?? 'Night Walker',
  email,
  genres: [],
  budget: 'mid',
  crowdPref: 'mixed',
  savedVenueIds: [],
  ticketHistory: [],
  createdAt: Date.now(),
  ageVerified: false,
});

// ── Apple Sign-In ─────────────────────────────────────────────────────────

export async function signInWithApple(): Promise<void> {
  const store = useAuthStore.getState();
  store.setLoading(true);
  try {
    /**
     * Production implementation:
     *
     * import * as AppleAuthentication from 'expo-apple-authentication';
     * import auth from '@react-native-firebase/auth';
     *
     * const credential = await AppleAuthentication.signInAsync({
     *   requestedScopes: [
     *     AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
     *     AppleAuthentication.AppleAuthenticationScope.EMAIL,
     *   ],
     * });
     * const { identityToken } = credential;
     * const appleCredential = auth.AppleAuthProvider.credential(identityToken!);
     * const userCredential = await auth().signInWithCredential(appleCredential);
     * const { uid, email, displayName } = userCredential.user;
     * store.setAuth(uid, 'apple');
     * store.setProfile(DEFAULT_PROFILE(uid, email ?? undefined, displayName ?? undefined));
     */

    // ── Stub (dev only) ──────────────────────────────────────────────────
    await new Promise(r => setTimeout(r, 800));
    const uid = 'apple_' + Date.now();
    store.setAuth(uid, 'apple');
    store.setProfile(DEFAULT_PROFILE(uid, 'user@privaterelay.appleid.com', 'Night Walker'));
  } catch (err: any) {
    store.setError(err?.message ?? 'Apple sign-in failed');
  } finally {
    store.setLoading(false);
  }
}

// ── Email / Password ───────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const store = useAuthStore.getState();
  store.setLoading(true);
  try {
    await new Promise(r => setTimeout(r, 600));
    const uid = 'email_' + Date.now();
    store.setAuth(uid, 'email');
    store.setProfile(DEFAULT_PROFILE(uid, email));
  } catch (err: any) {
    store.setError(err?.message ?? 'Sign-in failed');
  } finally {
    store.setLoading(false);
  }
}

export async function registerWithEmail(email: string, password: string): Promise<void> {
  const store = useAuthStore.getState();
  store.setLoading(true);
  try {
    await new Promise(r => setTimeout(r, 600));
    const uid = 'email_' + Date.now();
    store.setAuth(uid, 'email');
    store.setProfile(DEFAULT_PROFILE(uid, email));
  } catch (err: any) {
    store.setError(err?.message ?? 'Registration failed');
  } finally {
    store.setLoading(false);
  }
}

// ── Guest ──────────────────────────────────────────────────────────────────

export function continueAsGuest(): void {
  const store = useAuthStore.getState();
  store.setAuth('guest', 'guest');
  store.setProfile(DEFAULT_PROFILE('guest'));
}

// ── Sign Out ───────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  useAuthStore.getState().signOut();
}
