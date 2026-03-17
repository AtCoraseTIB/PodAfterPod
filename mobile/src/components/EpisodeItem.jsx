import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration, formatDate } from '../utils/format';
import { api } from '../api';

export default function EpisodeItem({ episode, podcastImage, onPlay, onRefresh }) {
  const image = episode.image_url || podcastImage;

  const handleMarkPlayed = async () => {
    try {
      await (episode.is_played ? api.markUnplayed(episode.id) : api.markPlayed(episode.id));
      onRefresh?.();
    } catch (e) {
      console.error(e);
    }
  };

  const handleQueue = async () => {
    try {
      await (episode.in_queue ? api.removeFromQueue(episode.id) : api.addToQueue(episode.id));
      onRefresh?.();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={[styles.container, episode.is_played && styles.played]}>
      <TouchableOpacity style={styles.main} onPress={() => onPlay(episode)}>
        {image ? (
          <Image source={{ uri: image }} style={styles.artwork} />
        ) : (
          <View style={[styles.artwork, styles.artworkPlaceholder]}>
            <Ionicons name="radio-outline" size={22} color="#555" />
          </View>
        )}

        <View style={styles.info}>
          <Text style={[styles.title, episode.is_played && styles.playedText]} numberOfLines={2}>
            {episode.title}
          </Text>
          <View style={styles.meta}>
            <Text style={styles.metaText}>{formatDate(episode.published_at)}</Text>
            {episode.duration ? (
              <Text style={styles.metaText}> · {formatDuration(episode.duration)}</Text>
            ) : null}
          </View>
          {episode.playback_position > 0 && !episode.is_played && (
            <View style={styles.resumeBar}>
              <View
                style={[
                  styles.resumeFill,
                  {
                    width: `${Math.min(100, (episode.playback_position / (episode.duration || 1)) * 100)}%`,
                  },
                ]}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onPlay(episode)} style={styles.actionBtn}>
          <Ionicons name="play-circle-outline" size={26} color="#7c5cbf" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleQueue} style={styles.actionBtn}>
          <Ionicons
            name={episode.in_queue ? 'remove-circle-outline' : 'add-circle-outline'}
            size={24}
            color={episode.in_queue ? '#e87d7d' : '#888'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMarkPlayed} style={styles.actionBtn}>
          <Ionicons
            name={episode.is_played ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={24}
            color={episode.is_played ? '#5cb85c' : '#888'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    marginHorizontal: 12,
    marginVertical: 4,
    overflow: 'hidden',
  },
  played: {
    opacity: 0.6,
  },
  main: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
  },
  artwork: {
    width: 56,
    height: 56,
    borderRadius: 6,
    flexShrink: 0,
  },
  artworkPlaceholder: {
    backgroundColor: '#2a2a3e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    color: '#eee',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  playedText: {
    color: '#777',
  },
  meta: {
    flexDirection: 'row',
    marginTop: 4,
  },
  metaText: {
    color: '#666',
    fontSize: 12,
  },
  resumeBar: {
    height: 3,
    backgroundColor: '#333',
    borderRadius: 2,
    marginTop: 6,
  },
  resumeFill: {
    height: 3,
    backgroundColor: '#7c5cbf',
    borderRadius: 2,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  actionBtn: {
    padding: 4,
  },
});
