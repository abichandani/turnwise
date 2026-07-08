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
