import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import MiniPlayer from '../../src/components/MiniPlayer';
import { usePlayerStore } from '../../src/store/playerStore';

function TabBarWithPlayer({ children }) {
  return (
    <View style={{ flex: 1 }}>
      {children}
      <MiniPlayer />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f0f1a',
          borderTopColor: '#1e1e2e',
        },
        tabBarActiveTintColor: '#7c5cbf',
        tabBarInactiveTintColor: '#555',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="queue"
        options={{
          title: 'Queue',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
