import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type BadgeTone = 'success' | 'danger' | 'purple' | 'neutral';

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const theme = useTheme();

  const toneStyle = {
    success: { backgroundColor: theme.successSoft, color: theme.success },
    danger: { backgroundColor: theme.dangerSoft, color: theme.danger },
    purple: { backgroundColor: theme.purpleSoft, color: theme.purple },
    neutral: { backgroundColor: theme.accentSoft, color: theme.textMuted },
  }[tone];

  return (
    <View style={[styles.base, { backgroundColor: toneStyle.backgroundColor }]}>
      <ThemedText type="small" style={{ color: toneStyle.color }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.pill,
    paddingVertical: Spacing.half + 3,
    paddingHorizontal: Spacing.two + 2,
    alignSelf: 'flex-start',
  },
});
