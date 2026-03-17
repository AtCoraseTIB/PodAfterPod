import { SafeAreaView } from 'react-native-safe-area-context';
import PlayerScreen from '../src/screens/PlayerScreen';

export default function PlayerModal() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f1a' }}>
      <PlayerScreen />
    </SafeAreaView>
  );
}
