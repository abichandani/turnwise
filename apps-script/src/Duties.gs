function listDuties() {
  return getSheetRows_(SHEET_NAMES.DUTIES)
    .filter(function (d) {
      return !d.is_deleted;
    })
    .map(publicDuty_);
}

function getMyDuties(payload, authContext) {
  return listDuties().filter(function (d) {
    return d.currentAssignedRoom === authContext.roomNumber;
  });
}

function completeDuty(payload, authContext) {
  var dutyId = payload && payload.dutyId;

  return withLock_(function () {
    var duty = findRowByKey_(SHEET_NAMES.DUTIES, 'duty_id', dutyId);
    if (!duty || duty.is_deleted) {
      throw AppError(ERROR_CODES.DUTY_NOT_FOUND, 'That duty no longer exists.');
    }
    if (duty.current_assigned_room !== authContext.roomNumber) {
      throw AppError(ERROR_CODES.DUTY_NOT_ASSIGNED_TO_YOU, "This duty isn't currently assigned to you.");
    }

    var now = nowIso_();
    var nextRoom = advanceDutyRotation_(duty, now, DUTY_STATUS.COMPLETED);

    appendLog_(EVENT_TYPES.DUTY_COMPLETED, authContext.roomNumber, { dutyId: dutyId });
    if (nextRoom) {
      appendLog_(EVENT_TYPES.DUTY_ASSIGNED, nextRoom, { dutyId: dutyId, name: duty.name });
    }

    return publicDuty_(findRowByKey_(SHEET_NAMES.DUTIES, 'duty_id', dutyId));
  });
}

function createDuty(payload, authContext) {
  var name = payload && payload.name && String(payload.name).trim();
  var description = (payload && payload.description) || '';
  var direction = payload && payload.direction === 'DESC' ? 'DESC' : 'ASC';

  return withLock_(function () {
    var now = nowIso_();
    var dutyId = Utilities.getUuid();
    var occupied = getActiveResidentRoomSet_();
    var initialRoom = getNextOccupiedRoom_(ROOM_LIST, direction, null, occupied);

    var attachmentFields = {
      attachment_drive_file_id: '',
      attachment_file_name: '',
      attachment_mime_type: '',
      attachment_url: '',
    };
    if (payload && payload.attachment) {
      attachmentFields = uploadDutyAttachment_(payload.attachment);
    }

    var duty = Object.assign(
      {
        duty_id: dutyId,
        name: name,
        description: description,
        direction: direction,
        current_assigned_room: initialRoom || '',
        is_deleted: false,
        deleted_at: '',
        created_at: now,
        updated_at: now,
      },
      attachmentFields
    );

    appendRow_(SHEET_NAMES.DUTIES, DUTIES_HEADERS, duty);
    if (initialRoom) {
      appendAssignmentHistory_(dutyId, initialRoom, now);
    }

    appendLog_(EVENT_TYPES.DUTY_CREATED, authContext.roomNumber, { dutyId: dutyId, name: name });
    if (initialRoom) {
      appendLog_(EVENT_TYPES.DUTY_ASSIGNED, initialRoom, { dutyId: dutyId, name: name });
    }

    return publicDuty_(duty);
  });
}

function updateDuty(payload, authContext) {
  var dutyId = payload && payload.dutyId;

  return withLock_(function () {
    var duty = findRowByKey_(SHEET_NAMES.DUTIES, 'duty_id', dutyId);
    if (!duty || duty.is_deleted) {
      throw AppError(ERROR_CODES.DUTY_NOT_FOUND, 'That duty no longer exists.');
    }

    var patch = { updated_at: nowIso_() };
    if (payload.name !== undefined) patch.name = String(payload.name).trim();
    if (payload.description !== undefined) patch.description = payload.description;
    if (payload.direction !== undefined) patch.direction = payload.direction === 'DESC' ? 'DESC' : 'ASC';

    if (payload.attachment) {
      var newAttachmentFields = uploadDutyAttachment_(payload.attachment);
      deleteDutyAttachment_(duty.attachment_drive_file_id);
      Object.assign(patch, newAttachmentFields);
    } else if (payload.removeAttachment) {
      deleteDutyAttachment_(duty.attachment_drive_file_id);
      patch.attachment_drive_file_id = '';
      patch.attachment_file_name = '';
      patch.attachment_mime_type = '';
      patch.attachment_url = '';
    }

    updateRowByKey_(SHEET_NAMES.DUTIES, 'duty_id', dutyId, patch);
    appendLog_(EVENT_TYPES.DUTY_UPDATED, authContext.roomNumber, { dutyId: dutyId });

    return publicDuty_(findRowByKey_(SHEET_NAMES.DUTIES, 'duty_id', dutyId));
  });
}

function deleteDuty(payload, authContext) {
  var dutyId = payload && payload.dutyId;

  return withLock_(function () {
    var duty = findRowByKey_(SHEET_NAMES.DUTIES, 'duty_id', dutyId);
    if (!duty || duty.is_deleted) {
      throw AppError(ERROR_CODES.DUTY_NOT_FOUND, 'That duty no longer exists.');
    }

    updateRowByKey_(SHEET_NAMES.DUTIES, 'duty_id', dutyId, {
      is_deleted: true,
      deleted_at: nowIso_(),
    });
    appendLog_(EVENT_TYPES.DUTY_DELETED, authContext.roomNumber, { dutyId: dutyId, name: duty.name });

    return { id: dutyId };
  });
}

function publicDuty_(duty) {
  var hasAttachment = !!duty.attachment_drive_file_id;
  return {
    id: duty.duty_id,
    name: duty.name,
    description: duty.description,
    direction: duty.direction,
    currentAssignedRoom: duty.current_assigned_room || null,
    attachment: hasAttachment
      ? { fileName: duty.attachment_file_name, mimeType: duty.attachment_mime_type, url: duty.attachment_url }
      : null,
  };
}

// Closes the duty's open ASSIGNED history row and advances the rotation to the next
// occupied room. Shared by completeDuty and resolveSkipRequest's approve path — the only
// difference between "completed" and "skipped" is what status the closed history row
// gets. Returns the next room (or null if no room is occupied).
function advanceDutyRotation_(duty, now, closedStatus) {
  closeOpenHistoryRow_(duty.duty_id, now, closedStatus);

  var occupied = getActiveResidentRoomSet_();
  var nextRoom = getNextOccupiedRoom_(ROOM_LIST, duty.direction, duty.current_assigned_room, occupied);

  updateRowByKey_(SHEET_NAMES.DUTIES, 'duty_id', duty.duty_id, {
    current_assigned_room: nextRoom || '',
    updated_at: now,
  });

  if (nextRoom) {
    appendAssignmentHistory_(duty.duty_id, nextRoom, now);
  }

  return nextRoom;
}

function closeOpenHistoryRow_(dutyId, now, status) {
  var rows = getSheetRows_(SHEET_NAMES.DUTY_HISTORY);
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].duty_id === dutyId && rows[i].status === DUTY_STATUS.ASSIGNED) {
      updateRowByKey_(SHEET_NAMES.DUTY_HISTORY, 'history_id', rows[i].history_id, {
        status: status,
        completed_at: now,
      });
      return;
    }
  }
}

function appendAssignmentHistory_(dutyId, roomNumber, now) {
  appendRow_(SHEET_NAMES.DUTY_HISTORY, DUTY_HISTORY_HEADERS, {
    history_id: Utilities.getUuid(),
    duty_id: dutyId,
    room_number: roomNumber,
    status: DUTY_STATUS.ASSIGNED,
    assigned_at: now,
    completed_at: '',
    created_at: now,
  });
}
