function appendLog_(eventType, actorRoomNumber, details) {
  appendRow_(SHEET_NAMES.LOGS, LOGS_HEADERS, {
    log_id: Utilities.getUuid(),
    event_type: eventType,
    timestamp: nowIso_(),
    actor_room_number: actorRoomNumber || null,
    details: JSON.stringify(details || {}),
  });
}
