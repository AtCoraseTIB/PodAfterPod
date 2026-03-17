import { SafeAreaView } from 'react-native-safe-area-context';
import LibraryScreen from '../../src/screens/LibraryScreen';

export default function LibraryTab() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f1a' }} edges={['top']}>
      <LibraryScreen />
    </SafeAreaView>
  );
}
