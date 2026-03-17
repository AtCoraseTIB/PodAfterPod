import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, TextInput, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePodcastStore } from '../store/podcastStore';

export default function LibraryScreen() {
  const router = useRouter();
  const { podcasts, loading, fetchPodcasts, subscribe, unsubscribe } = usePodcastStore();
  const [feedUrl, setFeedUrl] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const handleSubscribe = async () => {
    if (!feedUrl.trim()) return;
    setSubscribing(true);
    try {
      await subscribe(feedUrl.trim());
      setFeedUrl('');
      setShowInput(false);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribe = (podcast) => {
    Alert.alert(
      'Unsubscribe',
      `Remove "${podcast.title}" and all its episodes?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Unsubscribe', style: 'destructive', onPress: () => unsubscribe(podcast.id) },
      ]
    );
  };

  const renderPodcast = ({ item }) => (
    <TouchableOpacity
      style={styles.podcastRow}
      onPress={() => router.push({ pathname: '/episodes', params: { id: item.id, title: item.title } })}
      onLongPress={() => handleUnsubscribe(item)}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.artwork} />
      ) : (
        <View style={[styles.artwork, styles.artworkPlaceholder]}>
          <Ionicons name="radio" size={32} color="#555" />
        </View>
      )}
      <View style={styles.podcastInfo}>
        <Text style={styles.podcastTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.podcastMeta}>{item.author || ''}</Text>
        <Text style={styles.episodeCount}>{item.episode_count} episodes</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#555" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        <TouchableOpacity onPress={() => router.push('/search')} style={styles.headerBtn}>
          <Ionicons name="search" size={22} color="#7c5cbf" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowInput(!showInput)} style={styles.headerBtn}>
          <Ionicons name="add" size={26} color="#7c5cbf" />
        </TouchableOpacity>
      </View>

      {showInput && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Paste RSS feed URL..."
            placeholderTextColor="#555"
            value={feedUrl}
            onChangeText={setFeedUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <TouchableOpacity
            onPress={handleSubscribe}
            style={styles.subscribeBtn}
            disabled={subscribing}
          >
            {subscribing
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.subscribeBtnText}>Add</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={podcasts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPodcast}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchPodcasts} tintColor="#7c5cbf" />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Ionicons name="headset-outline" size={64} color="#333" />
              <Text style={styles.emptyText}>No podcasts yet</Text>
              <Text style={styles.emptySubtext}>Search for podcasts or paste an RSS feed URL</Text>
            </View>
          )
        }
        contentContainerStyle={podcasts.length === 0 && styles.emptyContainer}
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
  headerBtn: { padding: 4, marginLeft: 8 },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#0f0f1a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  input: {
    flex: 1,
    backgroundColor: '#1e1e2e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#eee',
    fontSize: 14,
  },
  subscribeBtn: {
    backgroundColor: '#7c5cbf',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  subscribeBtnText: { color: '#fff', fontWeight: '600' },
  podcastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
    gap: 12,
  },
  artwork: { width: 64, height: 64, borderRadius: 8 },
  artworkPlaceholder: {
    backgroundColor: '#1e1e2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podcastInfo: { flex: 1 },
  podcastTitle: { color: '#eee', fontSize: 15, fontWeight: '600' },
  podcastMeta: { color: '#777', fontSize: 13, marginTop: 2 },
  episodeCount: { color: '#555', fontSize: 12, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyText: { color: '#555', fontSize: 18, fontWeight: '600' },
  emptySubtext: { color: '#444', fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
});
