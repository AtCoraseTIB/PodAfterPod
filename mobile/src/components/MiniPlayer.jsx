import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePlayerStore } from '../store/playerStore';
import { formatTime } from '../utils/format';

export default function MiniPlayer() {
  const router = useRouter();
  const { currentEpisode, isPlaying, position, duration, togglePlay } = usePlayerStore();

  if (!currentEpisode) return null;

  const progress = duration > 0 ? position / duration : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/player')}
      activeOpacity={0.9}
    >
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.content}>
        {currentEpisode.image_url ? (
          <Image source={{ uri: currentEpisode.image_url }} style={styles.artwork} />
        ) : (
          <View style={[styles.artwork, styles.artworkPlaceholder]}>
            <Ionicons name="musical-notes" size={20} color="#888" />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentEpisode.title}
          </Text>
          <Text style={styles.time}>
            {formatTime(position)} / {formatTime(duration)}
          </Text>
        </View>

        <TouchableOpacity onPress={togglePlay} style={styles.playBtn}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e2e',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  progressBar: {
    height: 2,
    backgroundColor: '#333',
  },
  progressFill: {
    height: 2,
    backgroundColor: '#7c5cbf',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  artworkPlaceholder: {
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  time: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  playBtn: {
    padding: 4,
  },
});
