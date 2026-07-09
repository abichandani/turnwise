function getAwayRoomSet_() {
  var set = new Set();
  getSheetRows_(SHEET_NAMES.USERS).forEach(function (u) {
    if (!u.is_deleted && u.is_away) {
      set.add(u.room_number);
    }
  });
  return set;
}

function getDelegateRoomFor_(roomNumber) {
  var user = findRowByKey_(SHEET_NAMES.USERS, 'room_number', roomNumber);
  return (user && user.away_delegate_room) || '';
}

function appendAwayHistoryRow_(dutyId, roomNumber, status, now) {
  appendRow_(SHEET_NAMES.DUTY_HISTORY, DUTY_HISTORY_HEADERS, {
    history_id: Utilities.getUuid(),
    duty_id: dutyId,
    room_number: roomNumber,
    status: status,
    assigned_at: now,
    completed_at: now,
    created_at: now,
  });
}

// Walks the rotation forward from currentRoom (same semantics as getNextOccupiedRoom_)
// but treats any room marked away as unfit to actually hold the duty: if it named a
// valid delegate (occupied, not itself away, not itself), the duty hands off to the
// delegate and the walk stops there; otherwise the away room is auto-skipped and the
// walk continues. Every away room passed through gets a closed DutyAssignmentHistory
// row (AWAY_HANDOFF/AWAY_AUTO_SKIPPED) and a matching EVENT_TYPES log entry. Returns the
// final room the duty should land on (a normal occupied room, or a delegate room), or
// null if every occupied room is away with no usable delegate.
function pickRoomHandlingAway_(dutyId, direction, currentRoom, now) {
  var occupied = getActiveResidentRoomSet_();
  var away = getAwayRoomSet_();
  var pointer = currentRoom;
  var visited = new Set();

  for (var i = 0; i <= occupied.size; i++) {
    var candidate = getNextOccupiedRoom_(ROOM_LIST, direction, pointer, occupied);
    if (!candidate || visited.has(candidate)) {
      return null;
    }
    visited.add(candidate);

    if (!away.has(candidate)) {
      return candidate;
    }

    var delegateRoom = getDelegateRoomFor_(candidate);
    var validDelegate = delegateRoom && delegateRoom !== candidate && occupied.has(delegateRoom) && !away.has(delegateRoom);

    if (validDelegate) {
      appendAwayHistoryRow_(dutyId, candidate, DUTY_STATUS.AWAY_HANDOFF, now);
      appendLog_(EVENT_TYPES.AWAY_HANDOFF, candidate, { dutyId: dutyId, delegateRoom: delegateRoom });
      return delegateRoom;
    }

    appendAwayHistoryRow_(dutyId, candidate, DUTY_STATUS.AWAY_AUTO_SKIPPED, now);
    appendLog_(EVENT_TYPES.AWAY_AUTO_SKIPPED, candidate, { dutyId: dutyId });
    pointer = candidate;
  }

  return null;
}

function toggleAway(payload, authContext) {
  var isAway = !!(payload && payload.isAway);
  var delegateRoom = isAway && payload && payload.delegateRoom ? String(payload.delegateRoom).trim() : '';

  if (delegateRoom) {
    if (delegateRoom === authContext.roomNumber) {
      throw AppError(ERROR_CODES.INVALID_DELEGATE_ROOM, "You can't delegate to yourself.");
    }
    if (ROOM_LIST.indexOf(delegateRoom) === -1 || !getActiveResidentRoomSet_().has(delegateRoom)) {
      throw AppError(ERROR_CODES.INVALID_DELEGATE_ROOM, 'That room is not currently occupied.');
    }
  }

  var now = nowIso_();
  updateRowByKey_(SHEET_NAMES.USERS, 'room_number', authContext.roomNumber, {
    is_away: isAway,
    away_delegate_room: delegateRoom,
    updated_at: now,
  });

  appendLog_(EVENT_TYPES.AWAY_STATUS_CHANGED, authContext.roomNumber, {
    isAway: isAway,
    delegateRoom: delegateRoom || null,
  });

  return publicUser_(findRowByKey_(SHEET_NAMES.USERS, 'room_number', authContext.roomNumber));
}

function sendNudge(payload, authContext) {
  var dutyId = payload && payload.dutyId;

  var duty = findRowByKey_(SHEET_NAMES.DUTIES, 'duty_id', dutyId);
  if (!duty || duty.is_deleted) {
    throw AppError(ERROR_CODES.DUTY_NOT_FOUND, 'That duty no longer exists.');
  }
  if (!duty.current_assigned_room) {
    throw AppError(ERROR_CODES.DUTY_UNASSIGNED, "This duty isn't currently assigned to anyone.");
  }
  if (duty.current_assigned_room === authContext.roomNumber) {
    throw AppError(ERROR_CODES.CANNOT_NUDGE_YOURSELF, "You can't nudge yourself.");
  }

  appendLog_(EVENT_TYPES.NUDGE_SENT, authContext.roomNumber, {
    dutyId: dutyId,
    targetRoom: duty.current_assigned_room,
  });

  return { ok: true };
}
