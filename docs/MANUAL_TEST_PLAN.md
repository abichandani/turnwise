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

(Phases 2–10 checklists added as each phase lands.)
