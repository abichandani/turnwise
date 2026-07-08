import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export type TabBarIconProps = {
  emoji: string;
  label: string;
  focused: boolean;
};

export function TabBarIcon({ emoji, label, focused }: TabBarIconProps) {
  const theme = useTheme();

  return (
    <View style={[styles.base, !focused && styles.inactive]}>
      <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      <ThemedText type="small" style={[styles.label, { color: focused ? theme.accent : theme.textMuted }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    alignItems: 'center',
  },
  inactive: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 21,
    lineHeight: 25,
  },
  label: {
    fontSize: 10.5,
    marginTop: 1,
  },
});
