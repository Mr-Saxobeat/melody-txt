# Quickstart: Universal Edit Permissions

## What This Feature Does

Removes ownership-based restrictions so any authenticated user can edit, delete, and manage any melody or setlist in the system.

## Key Changes

### Backend (`backend/api/views.py`)

1. **MelodyViewSet.get_queryset**: Change from `Melody.objects.filter(user=self.request.user)` to `Melody.objects.all()`
2. **MelodyTabView.get_melody**: Change from `Melody.objects.filter(id=melody_id, user=request.user)` to `Melody.objects.filter(id=melody_id)`
3. **TransposeMelodyView.get_queryset**: Change from `Melody.objects.filter(user=self.request.user)` to `Melody.objects.all()`
4. **SetlistViewSet.get_queryset**: Change from `Setlist.objects.filter(user=self.request.user)` to `Setlist.objects.all()`
5. **SetlistEntryView.get_setlist**: Change from `Setlist.objects.filter(id=setlist_id, user=request.user)` to `Setlist.objects.filter(id=setlist_id)`

### Frontend (minimal)

- `MyMelodiesPage.js`: Update page title/label since it now shows all melodies, not just the user's own.

### Tests

- Update existing integration tests that assert owner-only access.
- Add new test file `test_universal_permissions.py` verifying cross-user CRUD.

## What NOT to Change

- Model schemas (no migrations needed)
- The `user` FK on Melody/Setlist (preserved for attribution)
- Public read-only endpoints (SharedMelodyView, RecentMelodiesView, etc.)
- Authentication mechanism (JWT via SimpleJWT)
- Frontend service layer (already uses ID-based calls)

## Testing Approach

```bash
# Run backend tests
cd backend && python -m pytest tests/ -v

# Run frontend tests
cd frontend && npm test
```

## Risk Assessment

- **Low risk**: The change is purely subtractive (removing filters). No new code paths are introduced.
- **Rollback**: Re-add `user=self.request.user` filters to restore previous behavior.
