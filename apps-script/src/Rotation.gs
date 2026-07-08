// Ported from shared/src/rotation.ts's getNextOccupiedRoom — keep both in sync.
// Apps Script can't import from shared/ (separate clasp-managed project), so this
// mirrors the ROOM_LIST porting convention already used in Constants.gs.
//
// roomList is the physical sequence of rooms around the floor. direction ASC walks the
// list forward (wrapping at the end), DESC walks it backward. currentRoom is the room
// the duty is presently assigned to, or null for a brand-new duty. occupiedRoomsSet is
// a Set of rooms with an active registered resident. Returns null only if no room is
// occupied.
function getNextOccupiedRoom_(roomList, direction, currentRoom, occupiedRoomsSet) {
  var n = roomList.length;
  if (n === 0) return null;

  var step = direction === 'ASC' ? 1 : -1;

  var base;
  if (currentRoom === null) {
    base = direction === 'ASC' ? -1 : n;
  } else {
    var idx = roomList.indexOf(currentRoom);
    base = idx === -1 ? 0 : idx;
  }

  for (var i = 1; i <= n; i++) {
    var candidateIdx = (((base + step * i) % n) + n) % n;
    var candidate = roomList[candidateIdx];
    if (occupiedRoomsSet.has(candidate)) return candidate;
  }
  return null;
}
