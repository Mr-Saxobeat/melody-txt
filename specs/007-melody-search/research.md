# Research: Melody Search

## R1: Server-side Search for Django REST Framework

**Decision**: Add a `search` query parameter to the `RecentMelodiesView` that filters melodies by title using case-insensitive substring matching (`title__icontains`).

**Rationale**: DRF has built-in `SearchFilter` but the existing `RecentMelodiesView` uses a hardcoded queryset slice (`[:50]`). Replacing the slice with proper pagination and adding `icontains` filtering on the `search` query param is simpler and more explicit than adding SearchFilter (which uses `icontains` internally anyway). This approach keeps the existing endpoint stable while adding search capability.

**Alternatives considered**:
- DRF `SearchFilter` backend: Would work but adds global config overhead and the view already uses a custom queryset. Manual `icontains` is more transparent.
- Django full-text search (`SearchVector`): Overkill for title-only substring matching on a small dataset. Worth revisiting if search scope expands.
- Third-party (Elasticsearch, Algolia): Unnecessary at current scale.

## R2: Pagination Strategy for Infinite Scroll

**Decision**: Use DRF's `CursorPagination` with `created_at` ordering for the home page endpoint. Cursor pagination is ideal for infinite scroll because it provides stable results when new items are added (no page drift), and avoids the performance cost of `OFFSET` on large tables.

**Rationale**: The existing global pagination is `PageNumberPagination` with `PAGE_SIZE=50`. The `RecentMelodiesView` currently bypasses pagination entirely by slicing `[:50]`. Switching to cursor pagination for this specific view gives efficient infinite scroll without affecting other endpoints.

**Alternatives considered**:
- `PageNumberPagination`: Works but suffers from page drift when new melodies are added while the user scrolls (items shift between pages). Also `OFFSET` gets slower as page number increases.
- `LimitOffsetPagination`: Same drift and performance issues as PageNumber.
- Keep slice with client-side filter: Rejected — user explicitly requires pagination + server-side search.

## R3: Frontend Debounce Approach

**Decision**: Use a custom `useDebounce` hook (or inline `setTimeout`/`clearTimeout` pattern) with ~300ms delay. No external library needed.

**Rationale**: The project already uses React hooks. A simple debounce hook is 5-10 lines of code. Adding lodash or a debounce library for one use is unnecessary.

**Alternatives considered**:
- `lodash.debounce`: Adds dependency for a trivial utility.
- `use-debounce` npm package: Unnecessary external dependency.
- No debounce (immediate fetch): Would flood the server on every keystroke.

## R4: Search in Add-to-Setlist Modal

**Decision**: Create a new API endpoint (`/api/melodies/search/`) or add search parameter support to the existing melody endpoints. The modal will use server-side search consistent with the home page, querying both the user's own melodies and public melodies.

**Rationale**: Per clarification, both search locations use server-side search for consistency. The modal needs to search across two scopes (user's own + public), so a search endpoint that combines these is needed.

**Alternatives considered**:
- Separate endpoints for own and public search: More complex frontend logic, two API calls per search.
- Reuse `RecentMelodiesView` with search param + separate user melodies call: Workable but the modal needs combined results.

## R5: Frontend Infinite Scroll Implementation

**Decision**: Use `IntersectionObserver` API to detect when a sentinel element near the bottom of the list enters the viewport, then trigger the next page fetch.

**Rationale**: `IntersectionObserver` is natively supported in all modern browsers, is performant (no scroll event listeners), and is the standard approach for infinite scroll in React applications.

**Alternatives considered**:
- Scroll event listener with threshold: Less performant, requires manual cleanup and throttling.
- `react-infinite-scroll-component`: External dependency for simple functionality.
