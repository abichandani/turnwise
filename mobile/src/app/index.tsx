import { ROOM_LIST } from '@turnwise/shared';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar, Badge, Button, Card, EmptyState, PillToggle, RoomRing, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

const SAMPLE_ASSIGNMENTS = [
  { roomNumber: ROOM_LIST[3], emoji: '📰', color: '#4B87C7' },
  { roomNumber: ROOM_LIST[10], emoji: '🦆', color: '#5AA46B' },
  { roomNumber: ROOM_LIST[0], emoji: '🍽️', color: '#EE9B3F' },
];

export default function DesignSystemShowcase() {
  const { status, user, signOut } = useAuth();
  const [direction, setDirection] = useState<'anti' | 'cw'>('anti');
  const [password, setPassword] = useState('');

  if (status === 'loading') {
    return (
      <ThemedView type="background" style={[styles.fill, styles.centered]}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (status === 'signedOut') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ThemedView type="background" style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="displayLarge">Turnwise</ThemedText>
          <ThemedText type="bodyMuted" style={styles.subheading}>
            Welcome back, {user?.name} — design system showcase
          </ThemedText>

          <Card style={styles.section}>
            <ThemedText type="title">Buttons</ThemedText>
            <View style={styles.row}>
              <Button label="Primary" variant="primary" flex onPress={() => {}} />
              <Button label="Secondary" variant="secondary" flex onPress={() => {}} />
            </View>
            <View style={styles.row}>
              <Button label="Danger" variant="danger" flex onPress={() => {}} />
              <Button label="Ghost" variant="ghost" flex onPress={() => {}} />
            </View>
          </Card>

          <Card style={styles.section}>
            <ThemedText type="title">Text field</ThemedText>
            <TextField
              label="PASSWORD"
              placeholder="Choose a password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              hint="Looks good."
              hintTone="success"
              style={styles.fieldSpacing}
            />
          </Card>

          <Card style={styles.section}>
            <ThemedText type="title">Pill toggle</ThemedText>
            <PillToggle
              options={[
                { value: 'anti', label: '↺ Anti-CW' },
                { value: 'cw', label: '↻ CW' },
              ]}
              value={direction}
              onChange={setDirection}
              activeColor="#EE9B3F"
            />
          </Card>

          <Card style={styles.section}>
            <ThemedText type="title">Badges &amp; avatars</ThemedText>
            <View style={styles.row}>
              <Badge label="Resident" tone="success" />
              <Badge label="Admin" tone="purple" />
              <Badge label="Denied" tone="danger" />
            </View>
            <View style={styles.row}>
              <Avatar name="Mara" />
              <Avatar name="Jonas" />
              <Avatar name="You" emphasized />
            </View>
          </Card>

          <Card style={styles.section}>
            <ThemedText type="title">Room ring ({ROOM_LIST.length} rooms)</ThemedText>
            <View style={styles.ringWrap}>
              <RoomRing rooms={ROOM_LIST} assignments={SAMPLE_ASSIGNMENTS} highlightRoomNumber={ROOM_LIST[0]} />
            </View>
          </Card>

          <View style={styles.section}>
            <EmptyState title="That's everything for now 🎉" subtitle="We'll ping you when a card lands on your door." />
          </View>

          <Button label="Log out" variant="secondary" onPress={signOut} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: Spacing.two + 2,
  },
  fieldSpacing: {
    marginTop: 0,
  },
  ringWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
});
