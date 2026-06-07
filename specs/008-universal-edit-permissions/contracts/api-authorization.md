# API Authorization Contract: Universal Edit Permissions

## Overview

All authenticated endpoints that previously restricted CRUD operations to the resource owner now allow any authenticated user to perform the same operations on any resource.

## Permission Matrix

| Endpoint | Method | Unauthenticated | Authenticated |
|----------|--------|-----------------|---------------|
| `/api/melodies/` | GET | 401 | List ALL melodies |
| `/api/melodies/` | POST | 401 | Create (attributed to requesting user) |
| `/api/melodies/{id}/` | GET | 401 | Retrieve ANY melody |
| `/api/melodies/{id}/` | PUT | 401 | Update ANY melody |
| `/api/melodies/{id}/` | DELETE | 401 | Delete ANY melody |
| `/api/melodies/{id}/tabs/` | GET | 401 | List tabs on ANY melody |
| `/api/melodies/{id}/tabs/` | POST | 401 | Add tab to ANY melody |
| `/api/melodies/{id}/tabs/{tab_id}/` | PUT | 401 | Update tab on ANY melody |
| `/api/melodies/{id}/tabs/{tab_id}/` | DELETE | 401 | Delete tab on ANY melody |
| `/api/melodies/{id}/transpose/` | POST | 401 | Transpose ANY melody |
| `/api/setlists/` | GET | 401 | List ALL setlists |
| `/api/setlists/` | POST | 401 | Create (attributed to requesting user) |
| `/api/setlists/{id}/` | GET | 401 | Retrieve ANY setlist |
| `/api/setlists/{id}/` | PUT | 401 | Update ANY setlist |
| `/api/setlists/{id}/` | DELETE | 401 | Delete ANY setlist |
| `/api/setlists/{id}/entries/` | POST | 401 | Add entry to ANY setlist |
| `/api/setlists/{id}/entries/{entry_id}/` | PUT | 401 | Update entry in ANY setlist |
| `/api/setlists/{id}/entries/{entry_id}/` | DELETE | 401 | Delete entry from ANY setlist |

## Unchanged Endpoints (public read-only)

| Endpoint | Method | Behavior |
|----------|--------|----------|
| `/api/melodies/recent/` | GET | Public, lists recent public melodies |
| `/api/melodies/shared/{share_id}/` | GET | Public, single public melody by share_id |
| `/api/melodies/search/` | GET | Authenticated, searches all melodies |
| `/api/setlists/recent/` | GET | Public, lists recent public setlists |
| `/api/setlists/shared/{share_id}/` | GET | Public, single public setlist by share_id |

## Response Behavior

- **Create** operations: `user` field is set to `request.user` (creator attribution).
- **Update** operations: `user` field is NOT modified (original creator preserved).
- **404 vs 403**: Non-existent resources return 404. There is no 403 — if authenticated, you have access.

## Invariants

1. Authentication (valid JWT) is required for all write operations.
2. The `user` FK on Melody/Setlist always represents the original creator.
3. Cascade delete behavior unchanged: deleting a melody removes its tabs and setlist entries.
