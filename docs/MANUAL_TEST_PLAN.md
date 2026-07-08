# Manual test plan

Apps Script has no local emulator and can't run inside Jest, so every real HTTP action, `LockService` behavior, Drive upload, and push notification is verified manually against the deployed Web App URL (see `docs/requests.http`). This checklist grows per phase and gets fully re-run in Phase 10.

## Phase 0
- [x] `npm install` succeeds at repo root / in `shared/`
- [x] `npm test` (shared workspace) passes — rotation.ts Jest suite (12/12 green)
- [ ] Deployed Web App: `GET ?action=ping` returns `{"ok":true,"data":{"pong":true}}` — needs a live deployment, see `docs/SETUP.md`
- [x] Expo app boots (Metro bundler starts, `tsc --noEmit` clean) — needs a real device/simulator walkthrough to confirm the rendered screen

(Phases 1–10 checklists added as each phase lands.)
