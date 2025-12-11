import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/shallow';

export type ActivityType = 'info' | 'success' | 'warning' | 'error' | 'generation';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  message: string;
  details?: string;
  timestamp: string;
}

interface ActivityState {
  events: ActivityEvent[];
  maxEvents: number;
  
  // Actions
  addEvent: (type: ActivityType, message: string, details?: string) => void;
  clearEvents: () => void;
  removeEvent: (eventId: string) => void;
}

export const useActivityStore = create<ActivityState>()(
  immer((set) => ({
    events: [],
    maxEvents: 100,
    
    addEvent: (type, message, details) =>
      set((state) => {
        const newEvent: ActivityEvent = {
          id: crypto.randomUUID(),
          type,
          message,
          details,
          timestamp: new Date().toISOString(),
        };
        state.events.unshift(newEvent);
        // Keep only maxEvents
        if (state.events.length > state.maxEvents) {
          state.events = state.events.slice(0, state.maxEvents);
        }
      }),
    
    clearEvents: () =>
      set((state) => {
        state.events = [];
      }),
    
    removeEvent: (eventId) =>
      set((state) => {
        state.events = state.events.filter((e) => e.id !== eventId);
      }),
  }))
);

// Helper hooks
export const useRecentEvents = (count = 10) =>
  useActivityStore(useShallow((state) => state.events.slice(0, count)));
