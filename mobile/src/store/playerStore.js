import { create } from 'zustand';
import { Audio } from 'expo-av';
import { api } from '../api';

let soundRef = null;
let progressInterval = null;

export const usePlayerStore = create((set, get) => ({
  currentEpisode: null,
  isPlaying: false,
  position: 0,       // seconds
  duration: 0,       // seconds
  playbackRate: 1.0,
  isLoading: false,

  playEpisode: async (episode) => {
    const { currentEpisode } = get();

    // Stop existing playback
    if (soundRef) {
      clearInterval(progressInterval);
      await soundRef.unloadAsync();
      soundRef = null;
    }

    if (!episode.audio_url) return;

    set({ currentEpisode: episode, isLoading: true, position: episode.playback_position || 0 });

    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });

    const { sound, status } = await Audio.Sound.createAsync(
      { uri: episode.audio_url },
      {
        shouldPlay: true,
        positionMillis: (episode.playback_position || 0) * 1000,
        rate: get().playbackRate,
        progressUpdateIntervalMillis: 1000,
      },
      (status) => {
        if (status.isLoaded) {
          set({
            position: Math.floor(status.positionMillis / 1000),
            duration: Math.floor((status.durationMillis || 0) / 1000),
            isPlaying: status.isPlaying,
            isLoading: false,
          });
          if (status.didJustFinish) {
            get().onEpisodeFinished();
          }
        }
      }
    );

    soundRef = sound;
    set({ isPlaying: true, isLoading: false });

    // Save progress every 10s
    progressInterval = setInterval(async () => {
      const { position, currentEpisode } = get();
      if (currentEpisode) {
        api.updateProgress(currentEpisode.id, position).catch(() => {});
      }
    }, 10000);
  },

  togglePlay: async () => {
    if (!soundRef) return;
    const { isPlaying } = get();
    if (isPlaying) {
      await soundRef.pauseAsync();
    } else {
      await soundRef.playAsync();
    }
    set({ isPlaying: !isPlaying });
  },

  seek: async (seconds) => {
    if (!soundRef) return;
    const ms = Math.max(0, seconds * 1000);
    await soundRef.setPositionAsync(ms);
    set({ position: seconds });
  },

  skipForward: async (seconds = 30) => {
    const { position } = get();
    get().seek(position + seconds);
  },

  skipBack: async (seconds = 15) => {
    const { position } = get();
    get().seek(Math.max(0, position - seconds));
  },

  setPlaybackRate: async (rate) => {
    if (soundRef) {
      await soundRef.setRateAsync(rate, true);
    }
    set({ playbackRate: rate });
  },

  onEpisodeFinished: async () => {
    const { currentEpisode } = get();
    if (currentEpisode) {
      await api.markPlayed(currentEpisode.id).catch(() => {});
    }
    clearInterval(progressInterval);
    set({ isPlaying: false, position: 0 });
  },
}));
