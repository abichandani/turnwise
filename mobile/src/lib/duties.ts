import { callAction } from './api';

export type DutyAttachment = {
  fileName: string;
  mimeType: string;
  url: string;
};

export type Duty = {
  id: string;
  name: string;
  description: string;
  direction: 'ASC' | 'DESC';
  currentAssignedRoom: string | null;
  attachment: DutyAttachment | null;
};

export type AttachmentUpload = {
  base64: string;
  fileName: string;
  mimeType: string;
};

export type DutyInput = {
  name: string;
  description: string;
  direction: 'ASC' | 'DESC';
  attachment?: AttachmentUpload;
  removeAttachment?: boolean;
};

export function listDuties(token: string): Promise<Duty[]> {
  return callAction<Duty[]>('listDuties', {}, token);
}

export function getMyDuties(token: string): Promise<Duty[]> {
  return callAction<Duty[]>('getMyDuties', {}, token);
}

export function completeDuty(token: string, dutyId: string): Promise<Duty> {
  return callAction<Duty>('completeDuty', { dutyId }, token);
}

export function createDuty(token: string, input: DutyInput): Promise<Duty> {
  return callAction<Duty>('createDuty', input, token);
}

export function updateDuty(token: string, dutyId: string, patch: Partial<DutyInput>): Promise<Duty> {
  return callAction<Duty>('updateDuty', { dutyId, ...patch }, token);
}

export function deleteDuty(token: string, dutyId: string): Promise<{ id: string }> {
  return callAction<{ id: string }>('deleteDuty', { dutyId }, token);
}
