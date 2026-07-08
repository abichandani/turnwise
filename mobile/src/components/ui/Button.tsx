import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  flex?: boolean;
};

export function Button({ label, variant = 'primary', loading, flex, disabled, ...rest }: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const variantStyle = {
    primary: {
      backgroundColor: isDisabled ? theme.cardBorder : theme.accent,
      borderWidth: 0,
      textColor: isDisabled ? theme.textFaintest : '#FFFFFF',
      shadow: !isDisabled,
    },
    secondary: {
      backgroundColor: theme.card,
      borderWidth: 1.5,
      borderColor: theme.inputBorder,
      textColor: theme.textMuted,
      shadow: false,
    },
    danger: {
      backgroundColor: theme.dangerSoft,
      borderWidth: 1.5,
      borderColor: theme.dangerBorder,
      textColor: theme.danger,
      shadow: false,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      textColor: theme.textFaintest,
      shadow: false,
    },
  }[variant];

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        flex && styles.flex,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderWidth: variantStyle.borderWidth,
          borderColor: 'borderColor' in variantStyle ? variantStyle.borderColor : undefined,
          opacity: pressed ? 0.85 : 1,
        },
        variantStyle.shadow && { shadowColor: theme.accent, ...styles.shadow },
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={variantStyle.textColor} />
      ) : (
        <ThemedText type="title" style={[styles.label, { color: variantStyle.textColor }]}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.md - 1,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  label: {
    fontSize: 15,
  },
  shadow: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
});
