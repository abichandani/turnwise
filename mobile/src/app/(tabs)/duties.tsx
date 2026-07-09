import { ROOM_LIST } from '@turnwise/shared';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DutyForm } from '@/components/DutyForm';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Badge, Button, Card, EmptyState, RoomRing } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { ApiError } from '@/lib/api';
import { sendNudge } from '@/lib/away';
import { createDuty, deleteDuty, listDuties, updateDuty, type Duty, type DutyInput } from '@/lib/duties';
import { listSkipRequests, resolveSkipRequest, type SkipRequest } from '@/lib/skip-requests';

const DUTY_VISUALS = [
  { emoji: '📰', color: '#4B87C7' },
  { emoji: '♻️', color: '#5AA46B' },
  { emoji: '🧽', color: '#EE9B3F' },
  { emoji: '🧺', color: '#7C5BB0' },
  { emoji: '🧴', color: '#C6543C' },
] as const;

export default function DutiesScreen() {
  const { user, token } = useAuth();
  const [duties, setDuties] = useState<Duty[] | null>(null);
  const [skipRequests, setSkipRequests] = useState<SkipRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingDutyId, setEditingDutyId] = useState<string | 'new' | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [nudgingId, setNudgingId] = useState<string | null>(null);
  const [nudgedIds, setNudgedIds] = useState<Set<string>>(new Set());

  const load = useCallback(
    async (isMounted: () => boolean = () => true) => {
      if (!token) return;
      setError(null);
      try {
        const [allDuties, pending] = await Promise.all([
          listDuties(token),
          user?.isAdmin ? listSkipRequests(token) : Promise.resolve([]),
        ]);
        if (!isMounted()) return;
        setDuties(allDuties);
        setSkipRequests(pending);
      } catch (e) {
        if (!isMounted()) return;
        setError(e instanceof ApiError ? e.message : 'Some error occurred.');
      }
    },
    [token, user?.isAdmin]
  );

  useEffect(() => {
    let mounted = true;
    load(() => mounted);
    return () => {
      mounted = false;
    };
  }, [load]);

  const onCreate = async (input: DutyInput) => {
    if (!token) return;
    await createDuty(token, input);
    setEditingDutyId(null);
    await load();
  };

  const onUpdate = async (dutyId: string, input: DutyInput) => {
    if (!token) return;
    await updateDuty(token, dutyId, input);
    setEditingDutyId(null);
    await load();
  };

  const onDelete = async (dutyId: string) => {
    if (!token) return;
    setBusyId(dutyId);
    try {
      await deleteDuty(token, dutyId);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Some error occurred.');
    } finally {
      setBusyId(null);
      setDeletingId(null);
    }
  };

  const onResolveSkip = async (requestId: string, decision: 'APPROVE' | 'DENY') => {
    if (!token) return;
    setResolvingId(requestId);
    try {
      await resolveSkipRequest(token, requestId, decision);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Some error occurred.');
    } finally {
      setResolvingId(null);
    }
  };

  const onNudge = async (dutyId: string) => {
    if (!token) return;
    setNudgingId(dutyId);
    setError(null);
    try {
      await sendNudge(token, dutyId);
      setNudgedIds((prev) => new Set(prev).add(dutyId));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Some error occurred.');
    } finally {
      setNudgingId(null);
    }
  };

  const pendingSkipRequests = skipRequests.filter((r) => r.status === 'PENDING');
  const dutyById = new Map((duties ?? []).map((d) => [d.id, d]));

  const assignments = (duties ?? [])
    .filter((d) => d.currentAssignedRoom)
    .map((d, i) => ({
      roomNumber: d.currentAssignedRoom as string,
      emoji: DUTY_VISUALS[i % DUTY_VISUALS.length].emoji,
      color: DUTY_VISUALS[i % DUTY_VISUALS.length].color,
    }));

  return (
    <ThemedView type="background" style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="displayLarge">Duties</ThemedText>
          <ThemedText type="bodyMuted" style={styles.subheading}>
            Everything on the floor, and who's holding it right now.
          </ThemedText>

          {error ? (
            <ThemedText type="small" themeColor="danger">
              {error}
            </ThemedText>
          ) : null}

          {duties === null ? (
            <ActivityIndicator />
          ) : (
            <>
              {user?.isAdmin && pendingSkipRequests.length > 0 ? (
                <Card style={styles.section}>
                  <ThemedText type="title">Skip requests</ThemedText>
                  {pendingSkipRequests.map((request) => (
                    <View key={request.id} style={styles.row}>
                      <View style={styles.grow}>
                        <ThemedText type="body">
                          {dutyById.get(request.dutyId)?.name ?? 'Unknown duty'} — Room {request.roomNumber}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textFaint">
                          &ldquo;{request.reason}&rdquo;
                        </ThemedText>
                      </View>
                      <Button
                        label="Approve"
                        variant="primary"
                        loading={resolvingId === request.id}
                        onPress={() => onResolveSkip(request.id, 'APPROVE')}
                      />
                      <Button
                        label="Deny"
                        variant="danger"
                        loading={resolvingId === request.id}
                        onPress={() => onResolveSkip(request.id, 'DENY')}
                      />
                    </View>
                  ))}
                </Card>
              ) : null}

              {duties.length > 0 ? (
                <Card style={styles.section}>
                  <View style={styles.ringWrap}>
                    <RoomRing rooms={ROOM_LIST} assignments={assignments} />
                  </View>
                </Card>
              ) : (
                <EmptyState title="No duties yet" subtitle="An admin hasn't added any duties for this floor." />
              )}

              {user?.isAdmin && editingDutyId === 'new' ? (
                <DutyForm onSubmit={onCreate} onCancel={() => setEditingDutyId(null)} />
              ) : user?.isAdmin ? (
                <Button label="+ Add duty" variant="secondary" onPress={() => setEditingDutyId('new')} />
              ) : null}

              {duties.map((duty) =>
                editingDutyId === duty.id ? (
                  <DutyForm
                    key={duty.id}
                    initial={duty}
                    onSubmit={(input) => onUpdate(duty.id, input)}
                    onCancel={() => setEditingDutyId(null)}
                  />
                ) : (
                  <Card key={duty.id} style={styles.section}>
                    <View style={styles.row}>
                      <ThemedText type="title" style={styles.grow}>
                        {duty.name}
                      </ThemedText>
                      {duty.currentAssignedRoom ? (
                        <Badge label={`Room ${duty.currentAssignedRoom}`} tone="success" />
                      ) : (
                        <Badge label="Unassigned" tone="neutral" />
                      )}
                    </View>
                    {duty.description ? <ThemedText type="bodyMuted">{duty.description}</ThemedText> : null}
                    {duty.attachment ? (
                      <ThemedText
                        type="small"
                        themeColor="accent"
                        onPress={() => WebBrowser.openBrowserAsync(duty.attachment!.url)}>
                        View attachment ({duty.attachment.fileName})
                      </ThemedText>
                    ) : null}

                    {duty.currentAssignedRoom && duty.currentAssignedRoom !== user?.roomNumber ? (
                      <Button
                        label={nudgedIds.has(duty.id) ? 'Nudge sent' : 'Nudge'}
                        variant="secondary"
                        loading={nudgingId === duty.id}
                        disabled={nudgedIds.has(duty.id)}
                        onPress={() => onNudge(duty.id)}
                      />
                    ) : null}

                    {user?.isAdmin ? (
                      deletingId === duty.id ? (
                        <View style={styles.row}>
                          <ThemedText type="small" themeColor="danger" style={styles.grow}>
                            Delete this duty?
                          </ThemedText>
                          <Button label="Cancel" variant="ghost" onPress={() => setDeletingId(null)} />
                          <Button
                            label="Delete"
                            variant="danger"
                            loading={busyId === duty.id}
                            onPress={() => onDelete(duty.id)}
                          />
                        </View>
                      ) : (
                        <View style={styles.row}>
                          <Button label="Edit" variant="secondary" flex onPress={() => setEditingDutyId(duty.id)} />
                          <Button label="Delete" variant="danger" flex onPress={() => setDeletingId(duty.id)} />
                        </View>
                      )
                    ) : null}
                  </Card>
                )
              )}
            </>
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
  section: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  grow: {
    flex: 1,
  },
  ringWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
});
