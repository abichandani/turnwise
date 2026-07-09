function nowIso_() {
  return new Date().toISOString();
}

function AppError(code, message) {
  var err = new Error(message || code);
  err.appErrorCode = code;
  return err;
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function okResponse_(data) {
  return jsonResponse_({ ok: true, data: data });
}

function errorResponse_(code, message) {
  return jsonResponse_({ ok: false, error: { code: code, message: message } });
}

// Runs fn() while holding the script-wide lock, always releasing it afterwards.
// Centralizing this avoids handlers forgetting to wrap a read-modify-write in a lock.
function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

// Constant-time string compare to avoid leaking secret length/content via early-exit timing.
function timingSafeEqual_(a, b) {
  var strA = String(a);
  var strB = String(b);
  var maxLen = Math.max(strA.length, strB.length);
  var diff = strA.length === strB.length ? 0 : 1;
  for (var i = 0; i < maxLen; i++) {
    var charA = i < strA.length ? strA.charCodeAt(i) : 0;
    var charB = i < strB.length ? strB.charCodeAt(i) : 0;
    diff |= charA ^ charB;
  }
  return diff === 0;
}
