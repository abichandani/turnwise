import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  hintTone?: 'muted' | 'danger' | 'success';
  multiline?: boolean;
};

export function TextField({ label, hint, hintTone = 'muted', style, multiline, ...rest }: TextFieldProps) {
  const theme = useTheme();
  const hintColor = { muted: theme.textFainter, danger: theme.danger, success: theme.success }[hintTone];

  return (
    <View>
      <ThemedText type="label">{label}</ThemedText>
      <TextInput
        placeholderTextColor={theme.placeholder}
        multiline={multiline}
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            borderColor: theme.inputBorder,
            color: theme.text,
          },
          multiline && styles.multiline,
          style,
        ]}
        {...rest}
      />
      {hint ? (
        <ThemedText type="small" themeColor={undefined} style={[styles.hint, { color: hintColor }]}>
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    marginTop: Spacing.two - 2,
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  hint: {
    marginTop: Spacing.two - 2,
    marginLeft: Spacing.one,
  },
});
