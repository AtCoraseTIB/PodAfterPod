import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../api';
import { usePlayerStore } from '../store/playerStore';
import EpisodeItem from '../components/EpisodeItem';

export default function QueueScreen() {
  const router = useRouter();
  const { playEpisode } = usePlayerStore();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = useCallback(async () => {
    try {
      const data = await api.getQueue();
      setQueue(data);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const handlePlay = (episode) => {
    playEpisode(episode);
    router.push('/player');
  };

  const handlePlayAll = () => {
    if (queue.length === 0) return;
    playEpisode(queue[0]);
    router.push('/player');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Queue</Text>
        {queue.length > 0 && (
          <TouchableOpacity onPress={handlePlayAll} style={styles.playAllBtn}>
            <Ionicons name="play" size={16} color="#fff" />
            <Text style={styles.playAllText}>Play All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={queue}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <View>
            <Text style={styles.queueIndex}>#{index + 1}</Text>
            <EpisodeItem
              episode={item}
              onPlay={handlePlay}
              onRefresh={loadQueue}
            />
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Ionicons name="list-outline" size={64} color="#333" />
              <Text style={styles.emptyText}>Queue is empty</Text>
              <Text style={styles.emptySubtext}>Add episodes from your library to the queue</Text>
            </View>
          )
        }
        onRefresh={loadQueue}
        refreshing={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  headerTitle: { flex: 1, color: '#fff', fontSize: 22, fontWeight: '700' },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7c5cbf',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playAllText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  list: { paddingVertical: 8 },
  queueIndex: { color: '#444', fontSize: 12, paddingHorizontal: 16, paddingTop: 8 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: '#555', fontSize: 18, fontWeight: '600' },
  emptySubtext: { color: '#444', fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
});
