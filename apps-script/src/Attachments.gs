function getDutyAttachmentsFolder_() {
  var folderId = PropertiesService.getScriptProperties().getProperty('DUTY_ATTACHMENTS_FOLDER_ID');
  if (!folderId) {
    throw new Error('Script property DUTY_ATTACHMENTS_FOLDER_ID is not set.');
  }
  return DriveApp.getFolderById(folderId);
}

// attachment: { base64, fileName, mimeType } — sent as-is from the mobile client since
// Apps Script Web Apps only accept a JSON body, not multipart form uploads.
function uploadDutyAttachment_(attachment) {
  if (!attachment || typeof attachment.base64 !== 'string' || !attachment.base64) {
    throw AppError(ERROR_CODES.INVALID_ATTACHMENT, 'No attachment data provided.');
  }
  if (attachment.base64.length > MAX_ATTACHMENT_BASE64_LENGTH) {
    throw AppError(ERROR_CODES.INVALID_ATTACHMENT, 'Attachment is too large.');
  }
  if (ALLOWED_ATTACHMENT_MIME_TYPES.indexOf(attachment.mimeType) === -1) {
    throw AppError(ERROR_CODES.INVALID_ATTACHMENT, 'Unsupported attachment file type.');
  }

  var bytes;
  try {
    bytes = Utilities.base64Decode(attachment.base64);
  } catch (e) {
    throw AppError(ERROR_CODES.INVALID_ATTACHMENT, 'Attachment data is not valid base64.');
  }
  var blob = Utilities.newBlob(bytes, attachment.mimeType, attachment.fileName);
  var file = getDutyAttachmentsFolder_().createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    attachment_drive_file_id: file.getId(),
    attachment_file_name: attachment.fileName,
    attachment_mime_type: attachment.mimeType,
    attachment_url: file.getUrl(),
  };
}

function deleteDutyAttachment_(fileId) {
  if (!fileId) return;
  try {
    DriveApp.getFileById(fileId).setTrashed(true);
  } catch (e) {
    // Already gone (manually deleted from Drive) — not fatal.
  }
}
