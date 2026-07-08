function requestSkip(payload, authContext) {
  var dutyId = payload && payload.dutyId;
  var reason = payload && payload.reason && String(payload.reason).trim();

  if (!reason) {
    throw AppError(ERROR_CODES.MISSING_REASON, 'Please provide a reason for skipping this duty.');
  }

  var duty = findRowByKey_(SHEET_NAMES.DUTIES, 'duty_id', dutyId);
  if (!duty || duty.is_deleted) {
    throw AppError(ERROR_CODES.DUTY_NOT_FOUND, 'That duty no longer exists.');
  }
  if (duty.current_assigned_room !== authContext.roomNumber) {
    throw AppError(ERROR_CODES.DUTY_NOT_ASSIGNED_TO_YOU, "This duty isn't currently assigned to you.");
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (findPendingSkipRequest_(dutyId, authContext.roomNumber)) {
      throw AppError(
        ERROR_CODES.SKIP_REQUEST_ALREADY_PENDING,
        'You already have a pending skip request for this duty.'
      );
    }

    var now = nowIso_();
    var request = {
      request_id: Utilities.getUuid(),
      duty_id: dutyId,
      room_number: authContext.roomNumber,
      reason: reason,
      status: SKIP_REQUEST_STATUS.PENDING,
      requested_at: now,
      resolved_at: '',
      resolved_by: '',
      resolution_note: '',
    };
    appendRow_(SHEET_NAMES.SKIP_REQUESTS, SKIP_REQUESTS_HEADERS, request);
    appendLog_(EVENT_TYPES.SKIP_REQUESTED, authContext.roomNumber, { dutyId: dutyId, reason: reason });

    return publicSkipRequest_(request);
  } finally {
    lock.releaseLock();
  }
}

function getMySkipRequests(payload, authContext) {
  return getSheetRows_(SHEET_NAMES.SKIP_REQUESTS)
    .filter(function (r) {
      return r.room_number === authContext.roomNumber;
    })
    .reverse()
    .map(publicSkipRequest_);
}

function listSkipRequests() {
  return getSheetRows_(SHEET_NAMES.SKIP_REQUESTS).reverse().map(publicSkipRequest_);
}

function resolveSkipRequest(payload, authContext) {
  var requestId = payload && payload.requestId;
  var approve = payload && payload.decision === 'APPROVE';
  var note = (payload && payload.note && String(payload.note).trim()) || '';

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var request = findRowByKey_(SHEET_NAMES.SKIP_REQUESTS, 'request_id', requestId);
    if (!request || request.status !== SKIP_REQUEST_STATUS.PENDING) {
      throw AppError(ERROR_CODES.SKIP_REQUEST_NOT_FOUND, 'That skip request is no longer pending.');
    }

    var now = nowIso_();
    updateRowByKey_(SHEET_NAMES.SKIP_REQUESTS, 'request_id', requestId, {
      status: approve ? SKIP_REQUEST_STATUS.APPROVED : SKIP_REQUEST_STATUS.DENIED,
      resolved_at: now,
      resolved_by: authContext.roomNumber,
      resolution_note: note,
    });

    if (approve) {
      var duty = findRowByKey_(SHEET_NAMES.DUTIES, 'duty_id', request.duty_id);
      if (duty && !duty.is_deleted) {
        var nextRoom = advanceDutyRotation_(duty, now, DUTY_STATUS.SKIPPED_APPROVED);
        if (nextRoom) {
          appendLog_(EVENT_TYPES.DUTY_ASSIGNED, nextRoom, { dutyId: duty.duty_id, name: duty.name });
        }
      }
      appendLog_(EVENT_TYPES.SKIP_APPROVED, request.room_number, {
        requestId: requestId,
        dutyId: request.duty_id,
      });
    } else {
      appendLog_(EVENT_TYPES.SKIP_DENIED, request.room_number, {
        requestId: requestId,
        dutyId: request.duty_id,
        note: note,
      });
    }

    return publicSkipRequest_(findRowByKey_(SHEET_NAMES.SKIP_REQUESTS, 'request_id', requestId));
  } finally {
    lock.releaseLock();
  }
}

function findPendingSkipRequest_(dutyId, roomNumber) {
  var rows = getSheetRows_(SHEET_NAMES.SKIP_REQUESTS);
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].duty_id === dutyId && rows[i].room_number === roomNumber && rows[i].status === SKIP_REQUEST_STATUS.PENDING) {
      return rows[i];
    }
  }
  return null;
}

function publicSkipRequest_(request) {
  return {
    id: request.request_id,
    dutyId: request.duty_id,
    roomNumber: request.room_number,
    reason: request.reason,
    status: request.status,
    requestedAt: request.requested_at,
    resolvedAt: request.resolved_at || null,
    resolvedBy: request.resolved_by || null,
    resolutionNote: request.resolution_note || null,
  };
}
