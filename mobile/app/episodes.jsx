import { SafeAreaView } from 'react-native-safe-area-context';
import EpisodesScreen from '../src/screens/EpisodesScreen';

export default function EpisodesPage() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f1a' }} edges={['top']}>
      <EpisodesScreen />
    </SafeAreaView>
  );
}
