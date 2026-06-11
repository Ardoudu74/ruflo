/**
 * Age verification — required by Apple App Store for ticket purchase.
 * DOB is stored locally only; never sent to any server in plain text.
 */

import { useAuthStore } from '../store/useAuthStore';

export function verifyAge(dob: string): { ok: boolean; reason?: string } {
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return { ok: false, reason: 'Invalid date' };

  const now  = new Date();
  const age  = now.getFullYear() - birth.getFullYear()
    - (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);

  if (age < 18) return { ok: false, reason: 'You must be 18+ to purchase tickets.' };

  useAuthStore.getState().patchProfile({ ageVerified: true, dob });
  return { ok: true };
}

export function requireAgeVerification(): boolean {
  return !useAuthStore.getState().profile?.ageVerified;
}
