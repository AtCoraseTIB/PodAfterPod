import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { usePlayerStore } from '../store/playerStore';
import { formatTime } from '../utils/format';

const RATES = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
const { width } = Dimensions.get('window');

export default function PlayerScreen() {
  const router = useRouter();
  const {
    currentEpisode,
    isPlaying,
    position,
    duration,
    playbackRate,
    isLoading,
    togglePlay,
    seek,
    skipForward,
    skipBack,
    setPlaybackRate,
  } = usePlayerStore();

  const [showDescription, setShowDescription] = useState(false);

  if (!currentEpisode) {
    return (
      <View style={styles.empty}>
        <Ionicons name="headset-outline" size={80} color="#333" />
        <Text style={styles.emptyText}>Nothing playing</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go to Library</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const nextRate = () => {
    const idx = RATES.indexOf(playbackRate);
    const next = RATES[(idx + 1) % RATES.length];
    setPlaybackRate(next);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-down" size={28} color="#aaa" />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>Now Playing</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Artwork */}
        {currentEpisode.image_url ? (
          <Image source={{ uri: currentEpisode.image_url }} style={styles.artwork} />
        ) : (
          <View style={[styles.artwork, styles.artworkPlaceholder]}>
            <Ionicons name="musical-notes" size={80} color="#555" />
          </View>
        )}

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.episodeTitle} numberOfLines={3}>
            {currentEpisode.title}
          </Text>
        </View>

        {/* Seek bar */}
        <View style={styles.seekSection}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 1}
            value={position}
            onSlidingComplete={seek}
            minimumTrackTintColor="#7c5cbf"
            maximumTrackTintColor="#333"
            thumbTintColor="#7c5cbf"
          />
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={() => skipBack(15)} style={styles.ctrlBtn}>
            <Ionicons name="play-back" size={32} color="#aaa" />
            <Text style={styles.skipLabel}>15</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlay} style={styles.playBtn} disabled={isLoading}>
            <Ionicons
              name={isLoading ? 'hourglass' : isPlaying ? 'pause-circle' : 'play-circle'}
              size={72}
              color="#7c5cbf"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => skipForward(30)} style={styles.ctrlBtn}>
            <Ionicons name="play-forward" size={32} color="#aaa" />
            <Text style={styles.skipLabel}>30</Text>
          </TouchableOpacity>
        </View>

        {/* Speed & extras */}
        <View style={styles.extras}>
          <TouchableOpacity onPress={nextRate} style={styles.rateBtn}>
            <Text style={styles.rateText}>{playbackRate}×</Text>
          </TouchableOpacity>
        </View>

        {/* Description toggle */}
        {currentEpisode.description && (
          <TouchableOpacity
            onPress={() => setShowDescription(!showDescription)}
            style={styles.descToggle}
          >
            <Text style={styles.descToggleText}>
              {showDescription ? 'Hide description' : 'Show description'}
            </Text>
            <Ionicons
              name={showDescription ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#7c5cbf"
            />
          </TouchableOpacity>
        )}

        {showDescription && (
          <Text style={styles.description}>{currentEpisode.description}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f1a',
    gap: 16,
  },
  emptyText: { color: '#555', fontSize: 20 },
  backLink: { marginTop: 8 },
  backLinkText: { color: '#7c5cbf', fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerBtn: { width: 40 },
  headerLabel: { color: '#888', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 40, alignItems: 'center' },
  artwork: {
    width: width - 80,
    height: width - 80,
    borderRadius: 16,
    marginVertical: 24,
  },
  artworkPlaceholder: {
    backgroundColor: '#1e1e2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: { width: '100%', marginBottom: 24 },
  episodeTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    textAlign: 'center',
  },
  seekSection: { width: '100%', marginBottom: 16 },
  slider: { width: '100%', height: 40 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -8 },
  timeText: { color: '#666', fontSize: 13 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  ctrlBtn: { alignItems: 'center' },
  skipLabel: { color: '#555', fontSize: 10, marginTop: 2 },
  playBtn: {},
  extras: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  rateBtn: {
    backgroundColor: '#1e1e2e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rateText: { color: '#7c5cbf', fontWeight: '700', fontSize: 15 },
  descToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  descToggleText: { color: '#7c5cbf', fontSize: 14 },
  description: {
    color: '#777',
    fontSize: 14,
    lineHeight: 22,
    width: '100%',
  },
});
