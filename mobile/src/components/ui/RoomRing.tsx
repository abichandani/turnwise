import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export type RoomRingAssignment = {
  roomNumber: string;
  emoji: string;
  color: string;
};

export type RoomRingProps = {
  rooms: readonly string[];
  assignments: readonly RoomRingAssignment[];
  highlightRoomNumber?: string;
  size?: number;
  radius?: number;
};

const DOT_TRACK = 52;

export function RoomRing({ rooms, assignments, highlightRoomNumber, size = 260, radius = 112 }: RoomRingProps) {
  const theme = useTheme();
  const assignmentByRoom = new Map(assignments.map((a) => [a.roomNumber, a]));
  const center = size / 2;
  const step = (2 * Math.PI) / rooms.length;

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.guide,
          {
            width: radius * 2 - 36,
            height: radius * 2 - 36,
            borderRadius: radius,
            borderColor: theme.inputBorder,
            left: center - (radius - 18),
            top: center - (radius - 18),
          },
        ]}
      />
      <View style={[styles.centerLabel, { left: center - 40, top: center - 20 }]}>
        <ThemedText type="display">{rooms.length}</ThemedText>
        <ThemedText type="label">ROOMS</ThemedText>
      </View>

      {rooms.map((room, i) => {
        const angle = -Math.PI / 2 + i * step;
        const left = center + radius * Math.cos(angle);
        const top = center + radius * Math.sin(angle);
        const assignment = assignmentByRoom.get(room);
        const isHighlighted = room === highlightRoomNumber;
        const showLabel = Boolean(assignment) || isHighlighted;

        return (
          <View
            key={room}
            style={[
              styles.node,
              { left: left - DOT_TRACK / 2, top: top - DOT_TRACK / 2, width: DOT_TRACK },
            ]}>
            {assignment ? (
              <View style={[styles.dotLarge, { backgroundColor: assignment.color, borderColor: theme.card }]}>
                <ThemedText style={styles.dotEmoji}>{assignment.emoji}</ThemedText>
              </View>
            ) : isHighlighted ? (
              <View style={[styles.dotHighlighted, { backgroundColor: theme.text, borderColor: theme.accent }]} />
            ) : (
              <View style={[styles.dotSmall, { backgroundColor: theme.inputBorder }]} />
            )}
            {showLabel ? (
              <ThemedText
                type="small"
                numberOfLines={1}
                style={{ color: assignment?.color ?? theme.text, marginTop: 3 }}>
                {room}
              </ThemedText>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  guide: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  centerLabel: {
    position: 'absolute',
    width: 80,
    alignItems: 'center',
  },
  node: {
    position: 'absolute',
    alignItems: 'center',
  },
  dotLarge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotEmoji: {
    fontSize: 15,
  },
  dotHighlighted: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 2,
  },
  dotSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
