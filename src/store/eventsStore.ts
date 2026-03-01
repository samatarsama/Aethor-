import { create } from 'zustand'
import type { PolitiEvent } from '@/types/politiloggen'

interface EventsState {
  events:          PolitiEvent[]
  loading:         boolean
  error:           string | null
  lastUpdated:     Date | null
  isFallback:      boolean
  selectedEventId: string | null

  setEvents:          (events: PolitiEvent[], isFallback?: boolean) => void
  setLoading:         (loading: boolean) => void
  setError:           (error: string | null) => void
  selectEvent:        (id: string | null) => void
}

export const useEventsStore = create<EventsState>((set) => ({
  events:          [],
  loading:         true,
  error:           null,
  lastUpdated:     null,
  isFallback:      false,
  selectedEventId: null,

  setEvents: (events, isFallback = false) =>
    set({ events, loading: false, error: null, lastUpdated: new Date(), isFallback }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error, loading: false }),

  selectEvent: (id) => set({ selectedEventId: id }),
}))
