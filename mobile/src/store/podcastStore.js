import { create } from 'zustand';
import { api } from '../api';

export const usePodcastStore = create((set, get) => ({
  podcasts: [],
  loading: false,
  error: null,

  fetchPodcasts: async () => {
    set({ loading: true, error: null });
    try {
      const podcasts = await api.listPodcasts();
      set({ podcasts, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },

  subscribe: async (feedUrl) => {
    const podcast = await api.subscribe(feedUrl);
    set((state) => ({ podcasts: [...state.podcasts, podcast] }));
    return podcast;
  },

  unsubscribe: async (id) => {
    await api.unsubscribe(id);
    set((state) => ({ podcasts: state.podcasts.filter((p) => p.id !== id) }));
  },

  refreshPodcast: async (id) => {
    const result = await api.refreshPodcast(id);
    await get().fetchPodcasts();
    return result;
  },
}));
