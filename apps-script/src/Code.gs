function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action === 'ping') {
    return okResponse_({ pong: true });
  }
  return errorResponse_(ERROR_CODES.UNKNOWN_ACTION, 'GET only supports ?action=ping');
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (parseError) {
    return errorResponse_(ERROR_CODES.UNKNOWN, 'Some error occurred.');
  }
  return handleRequest_(body);
}
