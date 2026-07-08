function register(payload) {
  var roomNumber = payload && payload.roomNumber;
  var name = payload && payload.name && String(payload.name).trim();
  var password = payload && payload.password;
  var floorPasskey = payload && payload.floorPasskey;

  if (ROOM_LIST.indexOf(roomNumber) === -1) {
    throw AppError(ERROR_CODES.INVALID_ROOM_NUMBER, 'That room number is not on this floor.');
  }
  if (!isPasswordStrongEnough_(password)) {
    throw AppError(ERROR_CODES.WEAK_PASSWORD, 'Password must be at least ' + MIN_PASSWORD_LENGTH + ' characters.');
  }
  var passkeyRow = findRowByKey_(SHEET_NAMES.FLOOR_CONFIG, 'key', FLOOR_CONFIG_KEYS.FLOOR_PASSKEY);
  if (!passkeyRow || String(floorPasskey) !== String(passkeyRow.value)) {
    throw AppError(ERROR_CODES.INVALID_PASSKEY, 'Incorrect floor passkey.');
  }

  // A just-vacated room could otherwise be double-registered by two concurrent requests.
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var existing = findRowByKey_(SHEET_NAMES.USERS, 'room_number', roomNumber);
    if (existing && !existing.is_deleted) {
      throw AppError(ERROR_CODES.DUPLICATE_ROOM, 'This room is already registered.');
    }

    var salt = generateSalt_();
    var now = nowIso_();
    var user = {
      room_number: roomNumber,
      name: name,
      password_hash: hashPassword_(password, salt),
      password_salt: salt,
      is_admin: false,
      must_change_password: false,
      expo_push_token: '',
      is_away: false,
      away_delegate_room: '',
      is_deleted: false,
      deleted_at: '',
      created_at: existing ? existing.created_at : now,
      updated_at: now,
    };

    if (existing) {
      updateRowByKey_(SHEET_NAMES.USERS, 'room_number', roomNumber, user);
    } else {
      appendRow_(SHEET_NAMES.USERS, USERS_HEADERS, user);
    }

    appendLog_(EVENT_TYPES.ACCOUNT_CREATED, roomNumber, { name: name });
    return { token: createToken_(user), user: publicUser_(user) };
  } finally {
    lock.releaseLock();
  }
}

function login(payload) {
  var roomNumber = payload && payload.roomNumber;
  var password = payload && payload.password;

  var user = findRowByKey_(SHEET_NAMES.USERS, 'room_number', roomNumber);
  // Same error for "no such room" and "wrong password" — don't reveal which one failed.
  if (!user || user.is_deleted || hashPassword_(password, user.password_salt) !== user.password_hash) {
    throw AppError(ERROR_CODES.INVALID_CREDENTIALS, 'Incorrect room number or password.');
  }

  return { token: createToken_(user), user: publicUser_(user) };
}

function getMe(payload, authContext) {
  var user = findRowByKey_(SHEET_NAMES.USERS, 'room_number', authContext.roomNumber);
  if (!user || user.is_deleted) {
    throw AppError(ERROR_CODES.USER_NOT_FOUND, 'User not found.');
  }
  return publicUser_(user);
}

function publicUser_(user) {
  return {
    roomNumber: user.room_number,
    name: user.name,
    isAdmin: !!user.is_admin,
    mustChangePassword: !!user.must_change_password,
    isAway: !!user.is_away,
    awayDelegateRoom: user.away_delegate_room || null,
  };
}
