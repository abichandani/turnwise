import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button, Card, EmptyState, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { ApiError } from '@/lib/api';
import { completeDuty, getMyDuties, type Duty } from '@/lib/duties';
import { getMySkipRequests, requestSkip, type SkipRequest } from '@/lib/skip-requests';

export default function HomeScreen() {
  const { user, token } = useAuth();
  const [duties, setDuties] = useState<Duty[] | null>(null);
  const [skipRequests, setSkipRequests] = useState<SkipRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [requestingSkipForId, setRequestingSkipForId] = useState<string | null>(null);
  const [skipReason, setSkipReason] = useState('');
  const [submittingSkipId, setSubmittingSkipId] = useState<string | null>(null);

  const load = useCallback(
    async (isMounted: () => boolean = () => true) => {
      if (!token) return;
      setError(null);
      try {
        const [myDuties, mySkipRequests] = await Promise.all([getMyDuties(token), getMySkipRequests(token)]);
        if (!isMounted()) return;
        setDuties(myDuties);
        setSkipRequests(mySkipRequests);
      } catch (e) {
        if (!isMounted()) return;
        setError(e instanceof ApiError ? e.message : 'Some error occurred.');
      }
    },
    [token]
  );

  useEffect(() => {
    let mounted = true;
    load(() => mounted);
    return () => {
      mounted = false;
    };
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

  const onSubmitSkip = async (dutyId: string) => {
    if (!token || !skipReason.trim()) return;
    setSubmittingSkipId(dutyId);
    setError(null);
    try {
      await requestSkip(token, dutyId, skipReason.trim());
      setRequestingSkipForId(null);
      setSkipReason('');
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Some error occurred.');
    } finally {
      setSubmittingSkipId(null);
    }
  };

  const pendingByDutyId = new Map(
    skipRequests.filter((r) => r.status === 'PENDING').map((r) => [r.dutyId, r])
  );

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
            duties.map((duty) => {
              const pendingSkip = pendingByDutyId.get(duty.id);

              return (
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

                  {pendingSkip ? (
                    <View style={styles.pendingNote}>
                      <ThemedText type="small" themeColor="accent">
                        Skip requested — waiting on an admin
                      </ThemedText>
                      <ThemedText type="small" themeColor="textFaint">
                        &ldquo;{pendingSkip.reason}&rdquo;
                      </ThemedText>
                    </View>
                  ) : requestingSkipForId === duty.id ? (
                    <View style={styles.buttonWrap}>
                      <TextField
                        label="REASON"
                        placeholder="Why do you need to skip this?"
                        value={skipReason}
                        onChangeText={setSkipReason}
                        multiline
                      />
                      <View style={styles.row}>
                        <Button
                          label="Cancel"
                          variant="ghost"
                          flex
                          onPress={() => {
                            setRequestingSkipForId(null);
                            setSkipReason('');
                          }}
                        />
                        <Button
                          label="Submit"
                          variant="primary"
                          flex
                          loading={submittingSkipId === duty.id}
                          onPress={() => onSubmitSkip(duty.id)}
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.row}>
                      <Button
                        label="Mark done"
                        variant="primary"
                        flex
                        loading={completingId === duty.id}
                        onPress={() => onComplete(duty.id)}
                      />
                      <Button
                        label="Request skip"
                        variant="secondary"
                        flex
                        onPress={() => setRequestingSkipForId(duty.id)}
                      />
                    </View>
                  )}
                </Card>
              );
            })
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
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  pendingNote: {
    marginTop: Spacing.one,
  },
});
