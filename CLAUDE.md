# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Turnwise tracks communal duties in a shared apartment (Wohngemeinschaft): recurring duties (trash, stove/counter wipe-down) rotate around occupied rooms on a fixed floor plan, with skip requests and an admin/user permission model.

## Source of truth (read before starting new work)

- `docs/instructions/instructions.md` — the original product spec. `docs/instructions/PHASE_PLAN.md` — the phase-by-phase roadmap; **check it before starting work to see what phase is next, and update it (mark items done, adjust status) as you complete work.**
- `docs/API_CONTRACT.md` — per-action request/response contract for the Apps Script backend.
- `docs/SHEET_SCHEMA.md` — authoritative Google Sheets schema (tab names, column order).
- `docs/MANUAL_TEST_PLAN.md` — manual QA checklist (there is no automated backend test suite).
- `docs/SETUP.md` — one-time manual setup (Google Sheet, clasp, script properties, EAS/push). This can't be scripted by an agent — it needs the human's Google/Expo accounts.

Note: the `docs/instructions/` folder is gitignored (root `.gitignore` ignores any `instructions/` path segment), so it won't show up in `git status` or diffs, but it exists on disk and is the real spec — read it directly.

## Repo structure

npm workspaces monorepo, no turbo/nx/lerna:
- `shared/` — `@turnwise/shared`, pure TypeScript (strict), tested with Jest. Currently just the room-rotation algorithm (`rotation.ts`, `types.ts`).
- `mobile/` — Expo SDK 57 app (React 19, React Native 0.86, expo-router). Routes live in `mobile/src/app/` (not `mobile/app/`). **`mobile/AGENTS.md` (imported by `mobile/CLAUDE.md`) warns Expo has changed significantly since training data — check https://docs.expo.dev/versions/v57.0.0/ before writing Expo code.**
- `apps-script/` — `@turnwise/apps-script`, the backend: Google Apps Script (`.gs`, ES5-style), deployed via `clasp`. **Google Sheets is the database** (tabs: Users, FloorConfig, Logs, Duties, DutyAssignmentHistory, SkipRequests — schema in `docs/SHEET_SCHEMA.md`). Google Drive stores duty attachments.

## Gotchas

- **`ROOM_LIST` is duplicated by hand** between `shared/src/types.ts` (TS) and `apps-script/src/Constants.gs` (Apps Script, which can't import npm packages). Update both when it changes.
- **`clasp push` only updates the Apps Script `/dev` version.** The live deployed Web App only picks up new code after `clasp deploy -i <deploymentId>`.
- **Error contract**: no unanticipated error should ever surface to the user as anything other than `"Some error occurred."` — enforced centrally in `Router.gs`'s catch block. Preserve this when touching backend error handling.
- The Apps Script backend is a single-endpoint action-dispatch router (`Router.gs`, `ACTIONS` map): all requests are POST with `{action, token, payload}` (auth token travels in the JSON body since Apps Script web apps can't read custom headers); `doGet` only supports `?action=ping`. Responses are always HTTP 200; failures are `{ok:false, error:{code,message}}`.
- Only `shared/` has automated tests. `apps-script/` is verified manually against a deployed Web App using `docs/requests.http`; `mobile/` has no automated tests either.

## Workflow / conventions

- Default brach is `master` which is supposed to contain the entire codebase. Follow conventional guidelines for commits in the following section. Include the phase numbers in `docs/instructions/PHASE_PLAN.md` in the commit messages.
- `npm run test --workspace=shared` runs the only automated test suite (Jest).
- Lint with `npm run lint --workspace=mobile` (Expo/React Compiler rules) and `npm run lint --workspace=shared` (typescript-eslint). `apps-script/` has no lint config (plain `.gs` files).

## Git Conventions

- Always work on the branch `agent/claude`. Never commit directly to `main`. If the branch doesn't exist, create it anew using `main`.
- Always pull from remote before writing any new changes.
- Make sure that the currently checked out branch is up-to-date with main. If there are merge conflicts, stop and verify with me on how to proceed further.
- Use Conventional Commits: `type(scope): summary` (feat, fix, docs, refactor, test, chore).
- Subject line under 72 characters, imperative mood. Description can be bigger.
- One logical change per commit — never bundle unrelated changes.
- Always run tests before committing.
- Before committing, run `git diff --staged` and review the actual changes, not just the file list.
- If a diff mixes multiple concerns, split it into separate commits.
- Never commit `.env`, `*.pem`, or anything in `secrets/`.
