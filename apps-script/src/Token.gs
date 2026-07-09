// Stateless signed tokens — no Sessions sheet. Apps Script has no in-memory session
// store, and writing a session row to Sheets on every request would add latency for
// no real benefit at this scale.

function getTokenSecret_() {
  var secret = PropertiesService.getScriptProperties().getProperty('TOKEN_SECRET');
  if (!secret) {
    throw new Error('Script property TOKEN_SECRET is not set.');
  }
  return secret;
}

function createToken_(user) {
  var payload = {
    room: user.room_number,
    admin: !!user.is_admin,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  var payloadB64 = Utilities.base64EncodeWebSafe(JSON.stringify(payload));
  var signatureB64 = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(payloadB64, getTokenSecret_())
  );
  return payloadB64 + '.' + signatureB64;
}

function verifyToken_(token) {
  var parts = token && token.split('.');
  if (!parts || parts.length !== 2) {
    throw AppError(ERROR_CODES.TOKEN_INVALID, 'Invalid token.');
  }

  var payloadB64 = parts[0];
  var signatureB64 = parts[1];
  var expectedSignatureB64 = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(payloadB64, getTokenSecret_())
  );
  if (!timingSafeEqual_(expectedSignatureB64, signatureB64)) {
    throw AppError(ERROR_CODES.TOKEN_INVALID, 'Invalid token.');
  }

  var payload;
  try {
    payload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(payloadB64)).getDataAsString());
  } catch (parseError) {
    throw AppError(ERROR_CODES.TOKEN_INVALID, 'Invalid token.');
  }

  if (!payload || typeof payload.exp !== 'number' || !payload.room) {
    throw AppError(ERROR_CODES.TOKEN_INVALID, 'Invalid token.');
  }
  if (Date.now() > payload.exp) {
    throw AppError(ERROR_CODES.TOKEN_EXPIRED, 'Your session has expired. Please log in again.');
  }

  return { roomNumber: payload.room, isAdmin: !!payload.admin };
}
