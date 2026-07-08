import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';

export default function RootIndex() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <ThemedView type="background" style={[styles.fill, styles.centered]}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return <Redirect href={status === 'signedIn' ? '/(tabs)/home' : '/(auth)/login'} />;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
