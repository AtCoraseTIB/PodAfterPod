import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../api';
import { usePodcastStore } from '../store/podcastStore';
import { usePlayerStore } from '../store/playerStore';
import EpisodeItem from '../components/EpisodeItem';

export default function EpisodesScreen() {
  const { id, title } = useLocalSearchParams();
  const router = useRouter();
  const { podcasts, refreshPodcast } = usePodcastStore();
  const { playEpisode } = usePlayerStore();

  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const podcast = podcasts.find((p) => p.id === Number(id));

  const loadEpisodes = useCallback(async () => {
    try {
      const data = await api.listEpisodes(id);
      setEpisodes(data);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEpisodes();
  }, [loadEpisodes]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await refreshPodcast(Number(id));
      await loadEpisodes();
      if (result.new_episodes > 0) {
        Alert.alert('Updated', `${result.new_episodes} new episode(s) added`);
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePlay = (episode) => {
    playEpisode(episode);
    router.push('/player');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c5cbf" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#7c5cbf" />
        </TouchableOpacity>
        {podcast?.image_url && (
          <Image source={{ uri: podcast.image_url }} style={styles.podcastThumb} />
        )}
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn} disabled={refreshing}>
          {refreshing
            ? <ActivityIndicator size="small" color="#7c5cbf" />
            : <Ionicons name="refresh" size={22} color="#7c5cbf" />
          }
        </TouchableOpacity>
      </View>

      <FlatList
        data={episodes}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <EpisodeItem
            episode={item}
            podcastImage={podcast?.image_url}
            onPlay={handlePlay}
            onRefresh={loadEpisodes}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No episodes found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f1a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    gap: 8,
  },
  backBtn: { padding: 4 },
  podcastThumb: { width: 32, height: 32, borderRadius: 4 },
  headerTitle: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '700' },
  refreshBtn: { padding: 4 },
  list: { paddingVertical: 8 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#555', fontSize: 16 },
});
