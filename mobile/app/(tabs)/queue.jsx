import { SafeAreaView } from 'react-native-safe-area-context';
import QueueScreen from '../../src/screens/QueueScreen';

export default function QueueTab() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f1a' }} edges={['top']}>
      <QueueScreen />
    </SafeAreaView>
  );
}
