import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar, Badge, Button, Card } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

export default function AccountScreen() {
  const { user, signOut } = useAuth();

  return (
    <ThemedView type="background" style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <View style={styles.content}>
          <ThemedText type="displayLarge">Account</ThemedText>

          <Card style={styles.card}>
            <View style={styles.row}>
              <Avatar name={user?.name ?? '?'} size={56} emphasized />
              <View style={styles.grow}>
                <ThemedText type="title">{user?.name}</ThemedText>
                <ThemedText type="bodyMuted">Room {user?.roomNumber}</ThemedText>
              </View>
              {user?.isAdmin ? <Badge label="Admin" tone="purple" /> : null}
            </View>
          </Card>

          <Button label="Log out" variant="secondary" onPress={signOut} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  card: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  grow: {
    flex: 1,
  },
});
