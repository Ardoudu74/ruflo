import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './storage';
import type { Ticket } from '../types/ticket';

interface TicketStore {
  tickets: Ticket[];
  add:      (t: Ticket) => void;
  markUsed: (id: string) => void;
  forUser:  (uid: string) => Ticket[];
}

export const useTicketStore = create<TicketStore>()(
  persist(
    (set, get) => ({
      tickets: [],

      add: (t) => set(s => ({ tickets: [t, ...s.tickets] })),

      markUsed: (id) => set(s => ({
        tickets: s.tickets.map(t =>
          t.id === id ? { ...t, status: 'used' as const, usedAt: Date.now() } : t),
      })),

      forUser: (uid) => get().tickets.filter(t => t.purchaserUid === uid),
    }),
    {
      name:    'nightout-tickets',
      storage: createJSONStorage(() => asyncStorage),
    }
  )
);
