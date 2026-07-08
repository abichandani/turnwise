import { Link } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button, Card, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { ApiError } from '@/lib/api';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [roomNumber, setRoomNumber] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [floorPasskey, setFloorPasskey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await register({
        roomNumber: roomNumber.trim(),
        name: name.trim(),
        password,
        floorPasskey: floorPasskey.trim(),
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Some error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView type="background" style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="displayLarge">Join the floor</ThemedText>
          <ThemedText type="bodyMuted" style={styles.subheading}>
            You&apos;ll need the floor passkey from a neighbour or admin.
          </ThemedText>

          <Card style={styles.card}>
            <TextField
              label="ROOM NUMBER"
              placeholder="e.g. 102"
              keyboardType="number-pad"
              autoCapitalize="none"
              value={roomNumber}
              onChangeText={setRoomNumber}
            />
            <TextField label="NAME" placeholder="Your name" value={name} onChangeText={setName} />
            <TextField
              label="PASSWORD"
              placeholder="At least 8 characters"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextField
              label="FLOOR PASSKEY"
              placeholder="6-digit code"
              keyboardType="number-pad"
              value={floorPasskey}
              onChangeText={setFloorPasskey}
            />
            {error ? (
              <ThemedText type="small" themeColor="danger" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}
            <View style={styles.buttonWrap}>
              <Button label="Create account" variant="primary" loading={loading} onPress={onSubmit} />
            </View>
          </Card>

          <View style={styles.linkWrap}>
            <Link href="/(auth)/login">
              <ThemedText type="bodyMuted" themeColor="accent">
                Already have an account? Log in
              </ThemedText>
            </Link>
          </View>
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
    gap: Spacing.three,
  },
  subheading: {
    marginTop: -Spacing.two,
  },
  card: {
    gap: Spacing.three,
  },
  error: {
    marginTop: -Spacing.two,
  },
  buttonWrap: {
    marginTop: Spacing.one,
  },
  linkWrap: {
    alignItems: 'center',
    marginTop: Spacing.two,
  },
});
