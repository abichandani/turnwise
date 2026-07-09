// Physical room sequence around the floor — fixed, not stored in the Sheet.
// Ported from shared/src/types.ts's ROOM_LIST; keep both in sync.
var ROOM_LIST = (function () {
  var rooms = [];
  for (var i = 0; i < 18; i++) rooms.push(String(102 + i));
  return rooms;
})();

var ADMIN_ROOM = 'ADMIN';

// Sheet tab names and header rows — column order must match docs/SHEET_SCHEMA.md exactly.
var SHEET_NAMES = {
  USERS: 'Users',
  FLOOR_CONFIG: 'FloorConfig',
  LOGS: 'Logs',
  DUTIES: 'Duties',
  DUTY_HISTORY: 'DutyAssignmentHistory',
  SKIP_REQUESTS: 'SkipRequests',
};

var USERS_HEADERS = [
  'room_number',
  'name',
  'password_hash',
  'password_salt',
  'is_admin',
  'must_change_password',
  'expo_push_token',
  'is_away',
  'away_delegate_room',
  'is_deleted',
  'deleted_at',
  'created_at',
  'updated_at',
];

var FLOORCONFIG_HEADERS = ['key', 'value', 'updated_at', 'updated_by'];

var LOGS_HEADERS = ['log_id', 'event_type', 'timestamp', 'actor_room_number', 'details'];

var DUTIES_HEADERS = [
  'duty_id',
  'name',
  'description',
  'direction',
  'current_assigned_room',
  'attachment_drive_file_id',
  'attachment_file_name',
  'attachment_mime_type',
  'attachment_url',
  'is_deleted',
  'deleted_at',
  'created_at',
  'updated_at',
];

var DUTY_HISTORY_HEADERS = [
  'history_id',
  'duty_id',
  'room_number',
  'status',
  'assigned_at',
  'completed_at',
  'created_at',
];

var DUTY_STATUS = {
  ASSIGNED: 'ASSIGNED',
  COMPLETED: 'COMPLETED',
  SKIPPED_APPROVED: 'SKIPPED_APPROVED',
  REASSIGNED_USER_DELETED: 'REASSIGNED_USER_DELETED',
  AWAY_HANDOFF: 'AWAY_HANDOFF',
  AWAY_AUTO_SKIPPED: 'AWAY_AUTO_SKIPPED',
};

var SKIP_REQUESTS_HEADERS = [
  'request_id',
  'duty_id',
  'room_number',
  'reason',
  'status',
  'requested_at',
  'resolved_at',
  'resolved_by',
  'resolution_note',
];

var SKIP_REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  DENIED: 'DENIED',
  CANCELLED: 'CANCELLED',
};

var FLOOR_CONFIG_KEYS = {
  FLOOR_PASSKEY: 'FLOOR_PASSKEY',
  RETENTION_DAYS: 'RETENTION_DAYS',
};

var DEFAULT_PASSWORD_HASH_ITERATIONS = 10000;
var TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
var MIN_PASSWORD_LENGTH = 8;
// Fixed salt used to hash the password on login attempts against a room that doesn't
// exist, so the hash chain always runs and its timing can't reveal room existence.
var DUMMY_PASSWORD_SALT = 'dummy-salt-for-nonexistent-room-timing-safety';

var MAX_ATTACHMENT_BASE64_LENGTH = 7 * 1024 * 1024; // ~5MB decoded, base64-inflated
var ALLOWED_ATTACHMENT_MIME_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf'];

var EVENT_TYPES = {
  ACCOUNT_CREATED: 'ACCOUNT_CREATED',
  ACCOUNT_DELETED: 'ACCOUNT_DELETED',
  FAILURE: 'FAILURE',
  DUTY_CREATED: 'DUTY_CREATED',
  DUTY_UPDATED: 'DUTY_UPDATED',
  DUTY_DELETED: 'DUTY_DELETED',
  DUTY_COMPLETED: 'DUTY_COMPLETED',
  DUTY_ASSIGNED: 'DUTY_ASSIGNED',
  SKIP_REQUESTED: 'SKIP_REQUESTED',
  SKIP_APPROVED: 'SKIP_APPROVED',
  SKIP_DENIED: 'SKIP_DENIED',
  USER_DELETED_BY_ADMIN: 'USER_DELETED_BY_ADMIN',
  USER_PROMOTED_TO_ADMIN: 'USER_PROMOTED_TO_ADMIN',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  DETAILS_UPDATED: 'DETAILS_UPDATED',
  PASSKEY_REGENERATED: 'PASSKEY_REGENERATED',
  PUSH_TOKEN_REGISTERED: 'PUSH_TOKEN_REGISTERED',
  AWAY_AUTO_SKIPPED: 'AWAY_AUTO_SKIPPED',
  AWAY_HANDOFF: 'AWAY_HANDOFF',
  NUDGE_SENT: 'NUDGE_SENT',
  CLEANUP_RUN: 'CLEANUP_RUN',
};

var ERROR_CODES = {
  UNKNOWN: 'UNKNOWN',
  UNKNOWN_ACTION: 'UNKNOWN_ACTION',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  DUPLICATE_ROOM: 'DUPLICATE_ROOM',
  INVALID_PASSKEY: 'INVALID_PASSKEY',
  INVALID_ROOM_NUMBER: 'INVALID_ROOM_NUMBER',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  MISSING_REASON: 'MISSING_REASON',
  DUTY_NOT_ASSIGNED_TO_YOU: 'DUTY_NOT_ASSIGNED_TO_YOU',
  DUTY_NOT_FOUND: 'DUTY_NOT_FOUND',
  SKIP_REQUEST_ALREADY_PENDING: 'SKIP_REQUEST_ALREADY_PENDING',
  SKIP_REQUEST_NOT_FOUND: 'SKIP_REQUEST_NOT_FOUND',
  FORBIDDEN_NOT_ADMIN: 'FORBIDDEN_NOT_ADMIN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  WRONG_OLD_PASSWORD: 'WRONG_OLD_PASSWORD',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  CANNOT_DELETE_SELF_VIA_ADMIN: 'CANNOT_DELETE_SELF_VIA_ADMIN',
  INVALID_ATTACHMENT: 'INVALID_ATTACHMENT',
};
