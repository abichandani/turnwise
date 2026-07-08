import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export type AvatarProps = {
  name: string;
  size?: number;
  emphasized?: boolean;
};

export function Avatar({ name, size = 36, emphasized = false }: AvatarProps) {
  const theme = useTheme();
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: emphasized ? theme.text : theme.accentSoft,
        },
      ]}>
      <ThemedText type="title" style={{ fontSize: size * 0.4, color: emphasized ? theme.surface : theme.textMuted }}>
        {initial}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
