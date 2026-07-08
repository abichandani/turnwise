# Google Sheet schema

Canonical schema, kept in sync with `apps-script/src/Constants.gs` and `SheetAccess.gs`. Filled in per-tab as each phase implements it. All timestamps are ISO 8601 strings; booleans are native Sheets `TRUE`/`FALSE`.

Room sequence (`ROOM_LIST`) is **not** stored in the Sheet — it's the hardcoded constant `102..119` in `Constants.gs` / `shared/src/types.ts`, in physical walking order around the floor.

## Users (Phase 2)
| column | type | notes |
|---|---|---|
| room_number | string, PK | `"102"`–`"119"` or `"ADMIN"` |
| name | string | |
| password_hash | string (hex) | |
| password_salt | string | |
| is_admin | boolean | |
| must_change_password | boolean | forced true on bootstrapped ADMIN row |
| expo_push_token | string, nullable | |
| is_away | boolean | Phase 5 |
| away_delegate_room | string, nullable | Phase 5 |
| is_deleted | boolean | |
| deleted_at | string, nullable | |
| created_at | string | |
| updated_at | string | |

## Duties (Phase 3)
| column | type | notes |
|---|---|---|
| duty_id | string, PK (UUID) | |
| name | string | |
| description | string | |
| direction | `"ASC"` \| `"DESC"` | |
| current_assigned_room | string, nullable | |
| attachment_drive_file_id | string, nullable | |
| attachment_file_name | string, nullable | |
| attachment_mime_type | string, nullable | |
| attachment_url | string, nullable | |
| is_deleted | boolean | |
| deleted_at | string, nullable | |
| created_at | string | |
| updated_at | string | |

## DutyAssignmentHistory (Phase 3)
| column | type | notes |
|---|---|---|
| history_id | string, PK (UUID) | |
| duty_id | string (FK) | |
| room_number | string | |
| status | `ASSIGNED` \| `COMPLETED` \| `SKIPPED_APPROVED` \| `REASSIGNED_USER_DELETED` \| `AWAY_HANDOFF` \| `AWAY_AUTO_SKIPPED` | |
| assigned_at | string | |
| completed_at | string, nullable | |
| created_at | string | |

## SkipRequests (Phase 4)
| column | type | notes |
|---|---|---|
| request_id | string, PK (UUID) | |
| duty_id | string (FK) | |
| room_number | string | requester |
| reason | string | required |
| status | `PENDING` \| `APPROVED` \| `DENIED` \| `CANCELLED` | |
| requested_at | string | |
| resolved_at | string, nullable | |
| resolved_by | string, nullable | |
| resolution_note | string, nullable | |

## Notifications (Phase 6 — in-app inbox)
| column | type | notes |
|---|---|---|
| notification_id | string, PK (UUID) | |
| room_number | string | recipient |
| type | string | mirrors push notification types |
| title | string | |
| body | string | |
| related_entity_id | string, nullable | |
| is_read | boolean | |
| created_at | string | |

## Logs (Phase 2 onward)
| column | type | notes |
|---|---|---|
| log_id | string, PK (UUID) | |
| event_type | string | see `EVENT_TYPES` in `Constants.gs` |
| timestamp | string | |
| actor_room_number | string, nullable | `"SYSTEM"` for trigger-originated events |
| details | string (JSON) | never contains plaintext passwords/secrets/passkey |

## FloorConfig (Phase 2)
| column | type | notes |
|---|---|---|
| key | string, PK | `FLOOR_PASSKEY`, `RETENTION_DAYS` |
| value | string | |
| updated_at | string | |
| updated_by | string, nullable | |

## Retention (Phase 9)
- `Logs`: rows where `timestamp` older than `RETENTION_DAYS` (365) are purged.
- `DutyAssignmentHistory`: only **closed** rows (`status != ASSIGNED`) where `completed_at` is older than the cutoff. The open assignment for any duty is never touched.
- `SkipRequests`: only resolved rows (`status != PENDING`) where `resolved_at` is older than the cutoff.
- `Users` / `Duties`: only soft-deleted rows where `deleted_at` is older than the cutoff — hard deleted, freeing the room number / trashing any Drive attachment.
- `FloorConfig`: never purged.
