# One-time setup

These steps can't be scripted by an agent — they need your Google/Expo accounts. Do them in order.

## Backend (Google Sheet + Apps Script)

1. Create a blank Google Sheet. Copy its ID from the URL (`https://docs.google.com/spreadsheets/d/<THIS_PART>/edit`).
2. `npm i -g @google/clasp` (or use `npx @google/clasp`), then `clasp login`.
3. From `apps-script/`: `clasp create --type standalone --title "Turnwise API"` (or `clasp clone <scriptId>` if the project already exists). This creates the real `.clasp.json` (gitignored — copy `.clasp.json.example` if you need the shape).
4. In the Apps Script editor → Project Settings → Script Properties, set:
   - `SPREADSHEET_ID` — from step 1
   - `TOKEN_SECRET` — a random secret, e.g. `openssl rand -hex 32`
   - `ADMIN_DEFAULT_PASSWORD` — a strong one-time password you choose (never hardcoded in source)
   - `PASSWORD_HASH_ITERATIONS` — `10000`
   - `DUTY_ATTACHMENTS_FOLDER_ID` — from step 5
5. Create a Google Drive folder for duty attachments (images/PDFs); copy its ID from the URL into the Script Property above.
6. `clasp push`, then in the Apps Script editor: Deploy → New deployment → type "Web app", execute as "Me", access "Anyone" → copy the Web App URL.
7. Run `bootstrapSheets()` once from the Apps Script editor (creates all tabs + header rows).
8. Run `bootstrapAdmin()` once (creates the `ADMIN` row, hashes `ADMIN_DEFAULT_PASSWORD`, sets `must_change_password = true`). After this the property value is no longer needed and can be cleared.
9. Run `createMonthlyCleanupTrigger()` once (installs the retention-cleanup time trigger; authorize requested scopes when prompted).
10. **Redeploy footgun**: `clasp push` alone only updates the `/dev` version. The live Web App URL only picks up new code after `clasp deploy -i <deploymentId>` (redeploy the existing deployment) or a brand new deployment.

## Mobile (Expo)

11. Copy `mobile/.env.example` to `mobile/.env` and set `EXPO_PUBLIC_API_BASE_URL` → the Web App URL from step 6.
12. Create an Expo account, `eas login`, `eas build:configure` — sets `projectId` in `app.json` (needed for push tokens).
13. Remote push notifications are **not supported in Expo Go as of SDK 53** — only local notifications work there. To test push (Phase 6), run `eas build --profile development` once per platform and install the dev-client build on a device/simulator.
14. (Optional, only for enhanced push security) generate an Expo access token in the EAS dashboard, set as `EXPO_ACCESS_TOKEN` Script Property.

## Floor-specific data

15. When the 3 real duties are created via the admin UI, set each duty's rotation `direction` (ASC/DESC) to match the floor's actual clockwise/anti-clockwise layout — the code has no way to infer which numeric direction is "clockwise" for you. Per the confirmed physical layout, rooms run 102 → 119 in walking order.
