# Research: Universal Edit Permissions

## Decision 1: How to Remove Ownership Restriction

**Decision**: Replace `user=self.request.user` queryset filters with `Model.objects.all()` in views that require `IsAuthenticated`.

**Rationale**: The current authorization model scopes CRUD to the requesting user via queryset filtering. Since the requirement is to allow any authenticated user to edit any content, the simplest approach is to remove the user filter from querysets while keeping `IsAuthenticated` permission class. This is a minimal, low-risk change.

**Alternatives considered**:
- Django object-level permissions (django-guardian): Overkill for "everyone can edit everything" — adds complexity with no benefit.
- Custom permission class: Unnecessary since `IsAuthenticated` already covers the requirement.
- Role-based access (groups): Not needed — there's only one role: "authenticated user with full access."

## Decision 2: Frontend Impact Assessment

**Decision**: Minimal frontend changes. The "My Melodies" page should show all melodies (not just the user's own), and the page label may need updating.

**Rationale**: The frontend service layer (`melodyService.js`, `setlistService.js`) already makes ID-based API calls. The backend returning all melodies instead of user-scoped ones is transparent to the frontend's edit/delete operations. The only visible change is the list endpoints returning broader results.

**Alternatives considered**:
- Separate "All Melodies" page: Unnecessary — simplifying to one view is cleaner.
- Keep "My Melodies" filtered and add separate "Community" page: Contradicts the requirement that all users can edit everything — there's no distinction.

## Decision 3: Handling the TransposeMelodyView

**Decision**: Also remove user-scoping from `TransposeMelodyView` so any authenticated user can transpose any melody.

**Rationale**: Transposition is a read-only computation that currently only works on the user's own melodies. Since the feature removes all ownership restrictions, this should be consistent.

## Decision 4: Preserving Creator Attribution

**Decision**: Keep the `user` ForeignKey on Melody and Setlist models unchanged. It records who created the content but no longer gates access.

**Rationale**: The spec explicitly requires preserving original creator attribution. The field remains useful for display (e.g., "Created by...") even though it no longer restricts editing.

## Decision 5: Concurrency Model

**Decision**: Last-write-wins (no optimistic locking).

**Rationale**: The spec explicitly accepts this model. The community tool scale does not warrant the complexity of conflict detection.
