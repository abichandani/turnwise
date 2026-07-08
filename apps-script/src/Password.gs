function generateSalt_() {
  return (Utilities.getUuid() + Utilities.getUuid()).split('-').join('');
}

function getPasswordHashIterations_() {
  var raw = PropertiesService.getScriptProperties().getProperty('PASSWORD_HASH_ITERATIONS');
  var parsed = parseInt(raw, 10);
  return parsed > 0 ? parsed : DEFAULT_PASSWORD_HASH_ITERATIONS;
}

function bytesToHex_(bytes) {
  return bytes
    .map(function (b) {
      var unsigned = (b + 256) % 256;
      var hex = unsigned.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('');
}

// Not true PBKDF2 (Apps Script has no native KDF) — a manually iterated SHA-256
// chain over salt+password, re-salted each round to blunt precomputed-chain attacks.
function hashPassword_(password, salt) {
  var iterations = getPasswordHashIterations_();
  var hex = bytesToHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + password));
  for (var i = 1; i < iterations; i++) {
    hex = bytesToHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, hex + salt));
  }
  return hex;
}

function isPasswordStrongEnough_(password) {
  return typeof password === 'string' && password.length >= MIN_PASSWORD_LENGTH;
}
