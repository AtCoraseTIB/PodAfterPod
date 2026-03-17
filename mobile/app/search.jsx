import { SafeAreaView } from 'react-native-safe-area-context';
import SearchScreen from '../src/screens/SearchScreen';

export default function SearchPage() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f1a' }} edges={['top']}>
      <SearchScreen />
    </SafeAreaView>
  );
}
