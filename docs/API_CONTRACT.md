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
- [ ] `listDuties` / `getMyDuties` / `completeDuty` — Phase 3
- [ ] `requestSkip` / `getMySkipRequests` — Phase 4
- [ ] `toggleAway` / `sendNudge` — Phase 5
- [ ] `listNotifications` / `markNotificationRead` / `markAllNotificationsRead` — Phase 6

## Admin-only
- [ ] `createDuty` / `updateDuty` / `deleteDuty` — Phase 3
- [ ] `listUsers` / `deleteUser` / `promoteUser` — Phase 7
- [ ] `listSkipRequests` / `resolveSkipRequest` — Phase 4
- [ ] `regeneratePasskey` / `getFloorConfig` — Phase 7
