import { create } from 'zustand'
import type { PolitiEvent } from '@/types/politiloggen'

interface EventsState {
  events:       PolitiEvent[]
  loading:      boolean
  error:        string | null
  lastUpdated:  Date | null
  isFallback:   boolean

  setEvents:     (events: PolitiEvent[], isFallback?: boolean) => void
  setLoading:    (loading: boolean) => void
  setError:      (error: string | null) => void
}

export const useEventsStore = create<EventsState>((set) => ({
  events:      [],
  loading:     true,
  error:       null,
  lastUpdated: null,
  isFallback:  false,

  setEvents: (events, isFallback = false) =>
    set({ events, loading: false, error: null, lastUpdated: new Date(), isFallback }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error, loading: false }),
}))
