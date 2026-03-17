import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../api';
import { usePodcastStore } from '../store/podcastStore';

export default function SearchScreen() {
  const router = useRouter();
  const { subscribe, podcasts } = usePodcastStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subscribing, setSubscribing] = useState(null); // podcast feed_url being subscribed

  const subscribedUrls = new Set(podcasts.map((p) => p.feed_url));

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await api.search(query.trim());
      setResults(data);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (item) => {
    setSubscribing(item.feed_url);
    try {
      await subscribe(item.feed_url);
      Alert.alert('Subscribed!', `Added "${item.title}" to your library`);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSubscribing(null);
    }
  };

  const renderResult = ({ item }) => {
    const isSubscribed = subscribedUrls.has(item.feed_url);
    const isLoading = subscribing === item.feed_url;

    return (
      <View style={styles.resultRow}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.artwork} />
        ) : (
          <View style={[styles.artwork, styles.artworkPlaceholder]}>
            <Ionicons name="radio" size={28} color="#555" />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.author} numberOfLines={1}>{item.author}</Text>
          {item.genre ? <Text style={styles.genre}>{item.genre}</Text> : null}
        </View>
        <TouchableOpacity
          style={[styles.subBtn, isSubscribed && styles.subBtnDone]}
          onPress={() => !isSubscribed && handleSubscribe(item)}
          disabled={isSubscribed || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name={isSubscribed ? 'checkmark' : 'add'}
              size={20}
              color="#fff"
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#7c5cbf" />
        </TouchableOpacity>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Search podcasts..."
            placeholderTextColor="#555"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {loading
            ? <ActivityIndicator style={styles.searchIcon} color="#7c5cbf" />
            : (
              <TouchableOpacity onPress={handleSearch} style={styles.searchIcon}>
                <Ionicons name="search" size={20} color="#7c5cbf" />
              </TouchableOpacity>
            )
          }
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.feed_url}
        renderItem={renderResult}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading && query.length > 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  backBtn: { padding: 4 },
  searchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e2e',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  input: { flex: 1, color: '#eee', fontSize: 15, paddingVertical: 10 },
  searchIcon: { padding: 4 },
  list: { paddingVertical: 8 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  artwork: { width: 60, height: 60, borderRadius: 8, flexShrink: 0 },
  artworkPlaceholder: {
    backgroundColor: '#1e1e2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  title: { color: '#eee', fontSize: 14, fontWeight: '600' },
  author: { color: '#777', fontSize: 13, marginTop: 2 },
  genre: { color: '#555', fontSize: 12, marginTop: 2 },
  subBtn: {
    backgroundColor: '#7c5cbf',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subBtnDone: { backgroundColor: '#4a4a5e' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#555', fontSize: 16 },
});
