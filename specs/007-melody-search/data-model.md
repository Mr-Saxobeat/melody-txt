# Data Model: Melody Search

## Existing Entities (No Schema Changes Required)

### Melody

The `Melody` model already has all fields needed for search and pagination:

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| title | CharField(200) | **Searchable field** — case-insensitive substring match |
| user | ForeignKey(User) | Owner, nullable |
| notation | TextField | Not searched |
| key | CharField(3) | Not searched |
| share_id | CharField(12) | Unique, indexed |
| is_public | BooleanField | Filter criterion for public melodies |
| created_at | DateTimeField | **Pagination cursor** — used for ordering and cursor-based pagination |
| updated_at | DateTimeField | Auto-updated |
| note_count | IntegerField | Computed on save |
| duration_seconds | FloatField | Computed on save |

### Existing Indexes

- `(user, -created_at)` — supports user-specific queries ordered by date
- `share_id` — supports shared melody lookups

### Recommended New Index

- `(is_public, -created_at)` — optimizes the home page query which filters by `is_public=True` and orders by `-created_at`. This is the primary query path for the paginated home page and search.

**Note**: No new index needed for `title` search at current scale. PostgreSQL `icontains` (which translates to `LIKE '%term%'`) performs adequately on small-to-medium datasets. If performance degrades, a `GIN` trigram index (`pg_trgm`) can be added later.

## Query Patterns

### Home Page (paginated, optionally filtered)

```
Melody.objects.filter(is_public=True)
  .filter(title__icontains=search_term)  # only if search_term provided
  .order_by('-created_at')
```

### Modal Search (user's own + public, filtered)

```
Melody.objects.filter(Q(user=request.user) | Q(is_public=True))
  .filter(title__icontains=search_term)  # only if search_term provided
  .order_by('-created_at')
  .distinct()
```

## State Transitions

No new state transitions introduced. Search is a read-only operation on existing data.
