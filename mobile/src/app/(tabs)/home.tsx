import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button, Card, EmptyState } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { ApiError } from '@/lib/api';
import { completeDuty, getMyDuties, type Duty } from '@/lib/duties';

export default function HomeScreen() {
  const { user, token } = useAuth();
  const [duties, setDuties] = useState<Duty[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      setDuties(await getMyDuties(token));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Some error occurred.');
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const onComplete = async (dutyId: string) => {
    if (!token) return;
    setCompletingId(dutyId);
    setError(null);
    try {
      await completeDuty(token, dutyId);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Some error occurred.');
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <ThemedView type="background" style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="displayLarge">Turnwise</ThemedText>
          <ThemedText type="bodyMuted" style={styles.subheading}>
            Hi {user?.name} — room {user?.roomNumber}
          </ThemedText>

          {error ? (
            <ThemedText type="small" themeColor="danger">
              {error}
            </ThemedText>
          ) : null}

          {duties === null ? (
            <ActivityIndicator />
          ) : duties.length === 0 ? (
            <EmptyState title="You're all caught up 🎉" subtitle="We'll ping you when a duty lands on your door." />
          ) : (
            duties.map((duty) => (
              <Card key={duty.id} style={styles.card}>
                <ThemedText type="title">{duty.name}</ThemedText>
                {duty.description ? <ThemedText type="bodyMuted">{duty.description}</ThemedText> : null}
                {duty.attachment ? (
                  <ThemedText
                    type="small"
                    themeColor="accent"
                    onPress={() => WebBrowser.openBrowserAsync(duty.attachment!.url)}>
                    View attachment ({duty.attachment.fileName})
                  </ThemedText>
                ) : null}
                <View style={styles.buttonWrap}>
                  <Button
                    label="Mark done"
                    variant="primary"
                    loading={completingId === duty.id}
                    onPress={() => onComplete(duty.id)}
                  />
                </View>
              </Card>
            ))
          )}
        </ScrollView>
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
  subheading: {
    marginTop: -Spacing.two,
  },
  card: {
    gap: Spacing.two,
  },
  buttonWrap: {
    marginTop: Spacing.one,
  },
});
