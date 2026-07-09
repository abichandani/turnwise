# API contract

Every real action is a POST to the deployed Apps Script Web App URL:

```json
// Request
{ "action": "completeDuty", "token": "<token or null>", "payload": { "dutyId": "..." } }

// Success
{ "ok": true, "data": { ... } }

// Failure
{ "ok": false, "error": { "code": "DUTY_NOT_ASSIGNED_TO_YOU", "message": "This duty isn't currently assigned to you." } }
```

`doGet` only supports `?action=ping` as a health check. Apps Script web apps can't read custom request headers, so the auth token travels inside the JSON body, not as an `Authorization` header. Responses are always HTTP 200 — errors are signaled in the JSON envelope.

Filled in per-action as each phase implements it; current status below.

## Public (no token)
- [x] `ping` — Phase 0
- [x] `register` — Phase 2
- [x] `login` — Phase 2

## Authenticated (any user)
- [x] `getMe` — Phase 2
- [ ] `updatePassword` / `updateDetails` / `deleteAccount` — Phase 8
- [ ] `registerPushToken` — Phase 6
- [x] `listDuties` / `getMyDuties` / `completeDuty` — Phase 3
- [x] `requestSkip` / `getMySkipRequests` — Phase 4
- [x] `toggleAway` / `sendNudge` — Phase 5
- [ ] `listNotifications` / `markNotificationRead` / `markAllNotificationsRead` — Phase 6

## Phase 5 action details

`toggleAway` — payload `{ isAway: boolean, delegateRoom?: string | null }`. `delegateRoom` is only
honored when `isAway` is `true`; it's cleared whenever `isAway` is `false`. Errors:
`INVALID_DELEGATE_ROOM` if `delegateRoom` is your own room or isn't a currently-occupied room on
the floor. Returns the caller's updated `PublicUser` (same shape as `getMe`).

`sendNudge` — payload `{ dutyId: string }`. Errors: `DUTY_NOT_FOUND`, `DUTY_UNASSIGNED` (nobody
currently holds it), `CANNOT_NUDGE_YOURSELF`. Logs `NUDGE_SENT` only — push delivery lands in
Phase 6's notification infra. Returns `{ ok: true }`.

Auto-skip / hand-off (not a client-facing action — runs inside duty-rotation advancement, i.e.
`completeDuty`, `resolveSkipRequest`'s approve path, and a brand-new duty's initial assignment):
whenever rotation would land on a room marked away, it either hands off to that room's
`away_delegate_room` (if one is set, occupied, and not itself away or the same room — logged as
`AWAY_HANDOFF`) or continues rotating past it (logged as `AWAY_AUTO_SKIPPED`), repeating until it
lands on a normal occupied room or every occupied room turns out to be away.

## Admin-only
- [x] `createDuty` / `updateDuty` / `deleteDuty` — Phase 3
- [ ] `listUsers` / `deleteUser` / `promoteUser` — Phase 7
- [x] `listSkipRequests` / `resolveSkipRequest` — Phase 4
- [ ] `regeneratePasskey` / `getFloorConfig` — Phase 7
