# Manual test plan

Apps Script has no local emulator and can't run inside Jest, so every real HTTP action, `LockService` behavior, Drive upload, and push notification is verified manually against the deployed Web App URL (see `docs/requests.http`). This checklist grows per phase and gets fully re-run in Phase 10.

## Phase 0
- [x] `npm install` succeeds at repo root / in `shared/`
- [x] `npm test` (shared workspace) passes — rotation.ts Jest suite (12/12 green)
- [ ] Deployed Web App: `GET ?action=ping` returns `{"ok":true,"data":{"pong":true}}` — needs a live deployment, see `docs/SETUP.md`
- [x] Expo app boots (Metro bundler starts, `tsc --noEmit` clean) — needs a real device/simulator walkthrough to confirm the rendered screen

## Phase 1
- [x] `tsc --noEmit` clean with the new theme tokens, fonts, and `@turnwise/shared` monorepo import
- [x] Web bundle compiles end-to-end via `expo start --web` (927 modules, no errors) — confirms Metro monorepo resolution + Google Fonts load
- [ ] Visual check on a real device/simulator: open the design-system showcase screen and confirm the warm cream/orange palette, Fredoka/Nunito fonts, and room ring render as expected (not yet done on-device, only verified via web bundle output)

## Phase 2
- [ ] `bootstrapSheets()` run from the Apps Script editor creates `Users`, `FloorConfig`, `Logs` tabs with correct header rows
- [ ] `bootstrapAdmin()` creates the `ADMIN` row with `must_change_password = TRUE`, and seeds `FloorConfig` with `FLOOR_PASSKEY` (6 digits) and `RETENTION_DAYS = 365`
- [ ] `register` happy path: valid room number + name + password + correct floor passkey → `{ ok: true, data: { token, user } }`, a new `Users` row, and an `ACCOUNT_CREATED` row in `Logs`
- [ ] `register` with a room number not in 102–119 → `INVALID_ROOM_NUMBER`
- [ ] `register` with wrong floor passkey → `INVALID_PASSKEY`
- [ ] `register` with a password under 8 characters → `WEAK_PASSWORD`
- [ ] `register` twice for the same room → second call → `DUPLICATE_ROOM`
- [ ] `login` happy path with the just-registered room/password → `{ ok: true, data: { token, user } }`
- [ ] `login` with wrong password or unknown room number → `INVALID_CREDENTIALS` in both cases (error doesn't reveal which)
- [ ] `getMe` with a valid token → returns that user's public fields (no `password_hash`/`password_salt`)
- [ ] `getMe` with no token / expired / tampered token → `TOKEN_INVALID` or `TOKEN_EXPIRED`
- [ ] Concurrent `register` for the same room number (two requests fired near-simultaneously via `docs/requests.http` or similar) — only one succeeds, confirming `LockService` prevents a double-registration race

## Phase 3
- [ ] `bootstrapSheets()` re-run creates `Duties` and `DutyAssignmentHistory` tabs with correct header rows (idempotent — existing tabs untouched)
- [ ] `createDuty` (as admin) happy path with 2+ registered rooms → assigns the first occupied room per `direction` (ASC → `ROOM_LIST[0]` if occupied, DESC → `ROOM_LIST[n-1]`), writes a `Duties` row, opens one `ASSIGNED` `DutyAssignmentHistory` row, logs `DUTY_CREATED` + `DUTY_ASSIGNED`
- [ ] `createDuty` with an image attachment (base64 payload) → Drive file created in `DUTY_ATTACHMENTS_FOLDER_ID`, shared `ANYONE_WITH_LINK`/`VIEW`, `attachment_url` opens the file in a browser
- [ ] `createDuty` with a PDF attachment → same as above, correct `mimeType`
- [ ] `createDuty` / `updateDuty` / `deleteDuty` called by a non-admin token → `FORBIDDEN_NOT_ADMIN`
- [ ] `listDuties` returns all non-deleted duties; `getMyDuties` (as the currently-assigned resident) returns only that duty
- [ ] `completeDuty` (as the assigned resident) happy path → closes the open history row (`status: COMPLETED`, `completed_at` set), rotates `current_assigned_room` to the next occupied room per `direction`, opens a new `ASSIGNED` history row, logs `DUTY_COMPLETED` + `DUTY_ASSIGNED`
- [ ] `completeDuty` called by a room the duty isn't assigned to → `DUTY_NOT_ASSIGNED_TO_YOU`
- [ ] `completeDuty` with an unknown/deleted `dutyId` → `DUTY_NOT_FOUND`
- [ ] `updateDuty` replacing an attachment trashes the old Drive file (confirm it lands in Drive trash, not left orphaned)
- [ ] `deleteDuty` soft-deletes (`is_deleted = TRUE`) — duty disappears from `listDuties`/`getMyDuties` but its `DutyAssignmentHistory` rows and Drive attachment are untouched (hard delete is Phase 9)
- [ ] Concurrent `completeDuty` calls for the same duty (fired near-simultaneously) — only one rotation happens, confirming `LockService` prevents a double-advance race
- [ ] Mobile: home tab shows assigned duties (or the empty-state message with none assigned) and "Mark done" completes + refreshes; duties tab shows the room ring + full duty list including admin add/edit/delete; account tab shows the signed-in user's info and logs out correctly

(Phases 4–10 checklists added as each phase lands.)
