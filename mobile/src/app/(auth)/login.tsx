import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button, Card, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { ApiError } from '@/lib/api';

export default function LoginScreen() {
  const { login } = useAuth();
  const [roomNumber, setRoomNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);

    if (!roomNumber.trim() || !password) {
      setError('Please enter your room number and password.');
      return;
    }

    setLoading(true);
    try {
      await login(roomNumber.trim(), password);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Some error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView type="background" style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <View style={styles.content}>
          <ThemedText type="displayLarge">Turnwise</ThemedText>
          <ThemedText type="bodyMuted" style={styles.subheading}>
            Log in with your room number and password.
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
            <TextField
              label="PASSWORD"
              placeholder="Your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.fieldSpacing}
            />
            {error ? (
              <ThemedText type="small" themeColor="danger" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}
            <View style={styles.buttonWrap}>
              <Button label="Log in" variant="primary" loading={loading} onPress={onSubmit} />
            </View>
          </Card>

          <View style={styles.linkWrap}>
            <Link href="/(auth)/register">
              <ThemedText type="bodyMuted" themeColor="accent">
                New here? Create an account
              </ThemedText>
            </Link>
          </View>
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
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  subheading: {
    marginTop: -Spacing.two,
  },
  card: {
    gap: Spacing.three,
  },
  fieldSpacing: {
    marginTop: 0,
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
