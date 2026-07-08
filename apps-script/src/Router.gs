// Action dispatch map. Each entry: { handler: fn(payload, authContext), requiresAuth: bool, requiresAdmin: bool }
// Populated incrementally as each domain file lands (Auth.gs, Users.gs, Duties.gs, ...).
var ACTIONS = {
  ping: { handler: function () { return { ok: true }; }, requiresAuth: false, requiresAdmin: false },
  register: { handler: register, requiresAuth: false, requiresAdmin: false },
  login: { handler: login, requiresAuth: false, requiresAdmin: false },
  getMe: { handler: getMe, requiresAuth: true, requiresAdmin: false },
  listDuties: { handler: listDuties, requiresAuth: true, requiresAdmin: false },
  getMyDuties: { handler: getMyDuties, requiresAuth: true, requiresAdmin: false },
  completeDuty: { handler: completeDuty, requiresAuth: true, requiresAdmin: false },
  createDuty: { handler: createDuty, requiresAuth: true, requiresAdmin: true },
  updateDuty: { handler: updateDuty, requiresAuth: true, requiresAdmin: true },
  deleteDuty: { handler: deleteDuty, requiresAuth: true, requiresAdmin: true },
  requestSkip: { handler: requestSkip, requiresAuth: true, requiresAdmin: false },
  getMySkipRequests: { handler: getMySkipRequests, requiresAuth: true, requiresAdmin: false },
  listSkipRequests: { handler: listSkipRequests, requiresAuth: true, requiresAdmin: true },
  resolveSkipRequest: { handler: resolveSkipRequest, requiresAuth: true, requiresAdmin: true },
};

function routeAction_(actionName, payload, token) {
  var entry = ACTIONS[actionName];
  if (!entry) {
    throw AppError(ERROR_CODES.UNKNOWN_ACTION, 'Unknown action: ' + actionName);
  }

  var authContext = null;
  if (entry.requiresAuth) {
    authContext = verifyToken_(token);
    if (entry.requiresAdmin && !authContext.isAdmin) {
      throw AppError(ERROR_CODES.FORBIDDEN_NOT_ADMIN, 'This action requires an admin account.');
    }
  }

  return entry.handler(payload, authContext);
}

function handleRequest_(body) {
  var action = body && body.action;
  var payload = (body && body.payload) || {};
  var token = (body && body.token) || null;

  try {
    var data = routeAction_(action, payload, token);
    return okResponse_(data);
  } catch (e) {
    if (e && e.appErrorCode) {
      return errorResponse_(e.appErrorCode, e.message);
    }
    logFailure_(action, e);
    return errorResponse_(ERROR_CODES.UNKNOWN, 'Some error occurred.');
  }
}

function logFailure_(action, e) {
  try {
    appendLog_(EVENT_TYPES.FAILURE, 'SYSTEM', {
      action: action,
      message: e && e.message,
      stack: e && e.stack,
    });
  } catch (loggingError) {
    // Logging must never itself break the error response path.
  }
}
