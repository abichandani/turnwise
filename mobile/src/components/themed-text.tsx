import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'display' | 'displayLarge' | 'title' | 'body' | 'bodyMuted' | 'small' | 'label' | 'code';
  themeColor?: ThemeColor;
};

const DEFAULT_COLOR_FOR_TYPE: Partial<Record<NonNullable<ThemedTextProps['type']>, ThemeColor>> = {
  bodyMuted: 'textMuted',
  small: 'textFaint',
  label: 'textFainter',
};

export function ThemedText({ style, type = 'body', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const color = theme[themeColor ?? DEFAULT_COLOR_FOR_TYPE[type] ?? 'text'];

  return (
    <Text
      style={[
        { color },
        type === 'displayLarge' && styles.displayLarge,
        type === 'display' && styles.display,
        type === 'title' && styles.title,
        type === 'body' && styles.body,
        type === 'bodyMuted' && styles.bodyMuted,
        type === 'small' && styles.small,
        type === 'label' && styles.label,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  displayLarge: {
    fontFamily: Fonts.display,
    fontSize: 40,
    lineHeight: 46,
  },
  display: {
    fontFamily: Fonts.display,
    fontSize: 27,
    lineHeight: 33,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 18,
    lineHeight: 23,
  },
  body: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15.5,
    lineHeight: 21,
  },
  bodyMuted: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13.5,
    lineHeight: 19,
  },
  small: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12.5,
    lineHeight: 17,
  },
  label: {
    fontFamily: Fonts.bodyExtraBold,
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 0.4,
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
});
