import { callAction, type PublicUser } from './api';

export function toggleAway(token: string, isAway: boolean, delegateRoom: string | null): Promise<PublicUser> {
  return callAction<PublicUser>('toggleAway', { isAway, delegateRoom }, token);
}

export function sendNudge(token: string, dutyId: string): Promise<{ ok: true }> {
  return callAction<{ ok: true }>('sendNudge', { dutyId }, token);
}
