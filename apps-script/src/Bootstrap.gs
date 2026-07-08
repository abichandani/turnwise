// One-time setup functions, run manually from the Apps Script editor per docs/SETUP.md.
// Idempotent — safe to re-run.

function bootstrapSheets() {
  ensureSheet_(SHEET_NAMES.USERS, USERS_HEADERS);
  ensureSheet_(SHEET_NAMES.FLOOR_CONFIG, FLOORCONFIG_HEADERS);
  ensureSheet_(SHEET_NAMES.LOGS, LOGS_HEADERS);
  ensureSheet_(SHEET_NAMES.DUTIES, DUTIES_HEADERS);
  ensureSheet_(SHEET_NAMES.DUTY_HISTORY, DUTY_HISTORY_HEADERS);
  // Later phases append their own tab creation here (SkipRequests in Phase 4,
  // Notifications in Phase 6).
}

function bootstrapAdmin() {
  var existing = findRowByKey_(SHEET_NAMES.USERS, 'room_number', ADMIN_ROOM);
  if (!existing) {
    var password = PropertiesService.getScriptProperties().getProperty('ADMIN_DEFAULT_PASSWORD');
    if (!password) {
      throw new Error('Script property ADMIN_DEFAULT_PASSWORD is not set.');
    }
    var salt = generateSalt_();
    var now = nowIso_();
    appendRow_(SHEET_NAMES.USERS, USERS_HEADERS, {
      room_number: ADMIN_ROOM,
      name: 'Admin',
      password_hash: hashPassword_(password, salt),
      password_salt: salt,
      is_admin: true,
      must_change_password: true,
      expo_push_token: '',
      is_away: false,
      away_delegate_room: '',
      is_deleted: false,
      deleted_at: '',
      created_at: now,
      updated_at: now,
    });
  }

  seedFloorConfigDefault_(FLOOR_CONFIG_KEYS.FLOOR_PASSKEY, generateFloorPasskey_());
  seedFloorConfigDefault_(FLOOR_CONFIG_KEYS.RETENTION_DAYS, '365');
}

function generateFloorPasskey_() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function seedFloorConfigDefault_(key, value) {
  if (findRowByKey_(SHEET_NAMES.FLOOR_CONFIG, 'key', key)) {
    return;
  }
  var now = nowIso_();
  appendRow_(SHEET_NAMES.FLOOR_CONFIG, FLOORCONFIG_HEADERS, {
    key: key,
    value: value,
    updated_at: now,
    updated_by: ADMIN_ROOM,
  });
}

function createMonthlyCleanupTrigger() {
  throw new Error('createMonthlyCleanupTrigger() is not implemented until Phase 9 (data retention).');
}
