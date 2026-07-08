import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type PillOption<T extends string> = {
  value: T;
  label: string;
};

export type PillToggleProps<T extends string> = {
  options: readonly PillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  activeColor?: string;
};

export function PillToggle<T extends string>({ options, value, onChange, activeColor }: PillToggleProps<T>) {
  const theme = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: theme.accentSoft }]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable key={option.value} style={styles.segment} onPress={() => onChange(option.value)}>
            <View
              style={[
                styles.pill,
                active && {
                  backgroundColor: theme.card,
                  shadowColor: theme.text,
                  ...styles.activeShadow,
                },
              ]}>
              <ThemedText
                type="small"
                style={{ color: active ? (activeColor ?? theme.accent) : theme.textFaint, textAlign: 'center' }}>
                {option.label}
              </ThemedText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: Radii.pill,
    padding: 3,
  },
  segment: {
    flex: 1,
  },
  pill: {
    borderRadius: Radii.pill,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  activeShadow: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 1,
  },
});
