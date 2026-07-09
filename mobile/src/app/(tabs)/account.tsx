import { ROOM_LIST } from '@turnwise/shared';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar, Badge, Button, Card, PillToggle } from '@/components/ui';
import { Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/lib/api';
import { toggleAway } from '@/lib/away';

const AWAY_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'away', label: 'Away' },
] as const;

export default function AccountScreen() {
  const { user, token, signOut, setUser } = useAuth();
  const theme = useTheme();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const delegateOptions = ROOM_LIST.filter((room) => room !== user?.roomNumber);

  const onToggleAway = async (isAway: boolean) => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await toggleAway(token, isAway, isAway ? (user?.awayDelegateRoom ?? null) : null);
      setUser(updated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Some error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const onSelectDelegate = async (room: string) => {
    if (!token || !user?.isAway) return;
    const nextDelegate = user.awayDelegateRoom === room ? null : room;
    setSaving(true);
    setError(null);
    try {
      const updated = await toggleAway(token, true, nextDelegate);
      setUser(updated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Some error occurred.');
    } finally {
      setSaving(false);
    }
  };

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

          <Card style={styles.card}>
            <ThemedText type="title">Away mode</ThemedText>
            <ThemedText type="bodyMuted">
              While you&rsquo;re away, your duty turns hand off to a delegate, or auto-skip to the next room if
              you don&rsquo;t pick one.
            </ThemedText>
            <PillToggle
              options={AWAY_OPTIONS}
              value={user?.isAway ? 'away' : 'home'}
              onChange={(value) => onToggleAway(value === 'away')}
            />

            {user?.isAway ? (
              <View style={styles.delegateSection}>
                <ThemedText type="small" themeColor="textFaint">
                  DELEGATE ROOM (OPTIONAL)
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  {delegateOptions.map((room) => {
                    const selected = user.awayDelegateRoom === room;
                    return (
                      <Pressable
                        key={room}
                        disabled={saving}
                        onPress={() => onSelectDelegate(room)}
                        style={[styles.chip, { backgroundColor: selected ? theme.accent : theme.accentSoft }]}>
                        <ThemedText type="small" style={{ color: selected ? '#FFFFFF' : theme.textMuted }}>
                          {room}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            {error ? (
              <ThemedText type="small" themeColor="danger">
                {error}
              </ThemedText>
            ) : null}
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
  delegateSection: {
    gap: Spacing.two,
  },
  chipRow: {
    gap: Spacing.two,
  },
  chip: {
    borderRadius: Radii.pill,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
