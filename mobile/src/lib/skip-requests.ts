import { callAction } from './api';

export type SkipRequestStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'CANCELLED';

export type SkipRequest = {
  id: string;
  dutyId: string;
  roomNumber: string;
  reason: string;
  status: SkipRequestStatus;
  requestedAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolutionNote: string | null;
};

export function requestSkip(token: string, dutyId: string, reason: string): Promise<SkipRequest> {
  return callAction<SkipRequest>('requestSkip', { dutyId, reason }, token);
}

export function getMySkipRequests(token: string): Promise<SkipRequest[]> {
  return callAction<SkipRequest[]>('getMySkipRequests', {}, token);
}

export function listSkipRequests(token: string): Promise<SkipRequest[]> {
  return callAction<SkipRequest[]>('listSkipRequests', {}, token);
}

export function resolveSkipRequest(
  token: string,
  requestId: string,
  decision: 'APPROVE' | 'DENY',
  note?: string
): Promise<SkipRequest> {
  return callAction<SkipRequest>('resolveSkipRequest', { requestId, decision, note }, token);
}
