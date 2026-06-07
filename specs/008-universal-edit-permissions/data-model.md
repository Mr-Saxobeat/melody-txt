# Data Model: Universal Edit Permissions

## Entity Changes

**No schema changes required.** This feature modifies authorization logic only — the data model is unchanged.

### Melody (unchanged)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| user | FK → User | Original creator (preserved for attribution, no longer gates access) |
| title | CharField(200) | Editable by any authenticated user |
| notation | TextField | Editable by any authenticated user |
| key | CharField(3) | Editable by any authenticated user |
| share_id | CharField(12) | Unique, auto-generated |
| is_public | BooleanField | Editable by any authenticated user |
| created_at | DateTimeField | Auto |
| updated_at | DateTimeField | Auto |
| note_count | IntegerField | Computed on save |
| duration_seconds | FloatField | Computed on save |

### MelodyTab (unchanged)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| melody | FK → Melody | CASCADE delete |
| instrument | CharField(20) | Choices: piano, saxophone, trumpet, trombone |
| notation | TextField | Editable by any authenticated user |
| position | IntegerField | Editable by any authenticated user |
| suffix | CharField(50) | Nullable, editable by any authenticated user |
| created_at | DateTimeField | Auto |

### Setlist (unchanged)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| user | FK → User | Original creator (preserved for attribution, no longer gates access) |
| title | CharField(200) | Editable by any authenticated user |
| share_id | CharField(12) | Unique, auto-generated |
| is_public | BooleanField | Editable by any authenticated user |
| created_at | DateTimeField | Auto |
| updated_at | DateTimeField | Auto |

### SetlistEntry (unchanged)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| setlist | FK → Setlist | CASCADE delete |
| melody | FK → Melody | CASCADE delete |
| position | IntegerField | Editable by any authenticated user |
| added_at | DateTimeField | Auto |

## Authorization Model Change

| Endpoint | Before | After |
|----------|--------|-------|
| `MelodyViewSet` (list/retrieve/update/delete) | `Melody.objects.filter(user=request.user)` | `Melody.objects.all()` |
| `MelodyTabView` (get/post/put/delete) | `Melody.objects.filter(id=melody_id, user=request.user)` | `Melody.objects.filter(id=melody_id)` |
| `TransposeMelodyView` | `Melody.objects.filter(user=request.user)` | `Melody.objects.all()` |
| `SetlistViewSet` (list/retrieve/update/delete) | `Setlist.objects.filter(user=request.user)` | `Setlist.objects.all()` |
| `SetlistEntryView` (post/put/delete) | `Setlist.objects.filter(id=setlist_id, user=request.user)` | `Setlist.objects.filter(id=setlist_id)` |

## Migrations

None required. No model schema changes.
