import { Direction } from './types';

/**
 * Computes the next occupied room for a duty's rotation.
 *
 * roomList is the physical sequence of rooms around the floor (e.g. ["102", ..., "119"]).
 * direction ASC walks the list forward (wrapping at the end), DESC walks it backward.
 * currentRoom is the room the duty is presently assigned to, or null for a brand-new duty
 * (in which case the first ASC room is roomList[0] and the first DESC room is roomList[n-1]).
 * occupiedRooms is the set of rooms with an active registered resident — unoccupied rooms
 * (never registered, or deleted) are skipped over. Returns null only if no room is occupied.
 */
export function getNextOccupiedRoom(
  roomList: readonly string[],
  direction: Direction,
  currentRoom: string | null,
  occupiedRooms: ReadonlySet<string>
): string | null {
  const n = roomList.length;
  if (n === 0) return null;

  const step = direction === 'ASC' ? 1 : -1;

  let base: number;
  if (currentRoom === null) {
    base = direction === 'ASC' ? -1 : n;
  } else {
    const idx = roomList.indexOf(currentRoom);
    base = idx === -1 ? 0 : idx;
  }

  for (let i = 1; i <= n; i++) {
    const idx = (((base + step * i) % n) + n) % n;
    const candidate = roomList[idx];
    if (occupiedRooms.has(candidate)) return candidate;
  }
  return null;
}
