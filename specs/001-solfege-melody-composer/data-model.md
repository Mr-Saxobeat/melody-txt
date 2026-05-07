# Data Model: Solfege Melody Composer

**Feature**: Solfege Melody Composer  
**Date**: 2026-05-07  
**Phase**: Phase 1 - Data Design

## Entity Relationship Overview

```
┌─────────────┐         ┌──────────────┐
│    User     │1      * │    Melody    │
│             ├─────────┤              │
│ (author)    │         │              │
└─────────────┘         └──────────────┘
```

**Relationships**:
- One User can create many Melodies (1:N)
- One Melody belongs to one User (author)
- Melodies can be shared publicly via unique share identifier

---

## Entity: User

**Purpose**: Represents a registered musician who can save and manage melodies

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | UUID | Primary Key, Auto-generated | Unique user identifier |
| `username` | String | Unique, Required, Max 150 chars | Display name for user |
| `email` | String | Unique, Required, Valid email format | User email address |
| `password` | String | Required, Hashed (bcrypt) | Authentication credential |
| `created_at` | Timestamp | Auto-set on creation | Account creation date/time |
| `updated_at` | Timestamp | Auto-update on modification | Last profile update |
| `is_active` | Boolean | Default: True | Account active status |

### Validation Rules

- **username**:
  - Required on registration
  - 3-150 characters
  - Alphanumeric, underscores, hyphens only
  - Case-insensitive uniqueness check
  - Cannot start with underscore or hyphen

- **email**:
  - Required on registration
  - Valid RFC 5322 email format
  - Case-insensitive uniqueness check
  - Must not be from disposable email domains (future enhancement)

- **password**:
  - Minimum 8 characters
  - Must contain: uppercase, lowercase, number
  - Hashed using bcrypt (cost factor 12)
  - Never returned in API responses

### Business Rules

- Users must verify email before saving melodies (future enhancement)
- Inactive users cannot authenticate but melodies remain accessible via share links
- User deletion soft-deletes account (preserves melodies for data integrity)
- Username can be changed once per 30 days (future enhancement)

### Indexes

- Primary: `id` (UUID)
- Unique: `username` (case-insensitive)
- Unique: `email` (case-insensitive)
- Query: `created_at` (for analytics)

---

## Entity: Melody

**Purpose**: Represents a musical composition created by a user using solfege notation

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | UUID | Primary Key, Auto-generated | Unique melody identifier |
| `user_id` | UUID | Foreign Key → User.id, Nullable | Author of melody (null for anonymous) |
| `title` | String | Required, Max 200 chars | User-provided melody name |
| `notation` | Text | Required | Solfege notation (space-separated) |
| `key` | String | Default: "C", Enum | Musical key (C, D, E, F, G, A, B + major/minor) |
| `share_id` | String | Unique, Auto-generated, Length 12 | Public share identifier |
| `is_public` | Boolean | Default: True | Public share link enabled |
| `created_at` | Timestamp | Auto-set on creation | Melody creation date/time |
| `updated_at` | Timestamp | Auto-update on modification | Last edit date/time |
| `note_count` | Integer | Computed | Number of notes in melody |
| `duration_seconds` | Float | Computed | Estimated playback duration |

### Validation Rules

- **title**:
  - Required when saving melody
  - 1-200 characters
  - Trim leading/trailing whitespace
  - Cannot be only whitespace

- **notation**:
  - Required, non-empty
  - Contains only valid solfege syllables: do, re, mi, fa, sol, la, si
  - Case-insensitive (normalized to lowercase)
  - Separated by spaces or commas
  - Maximum 10,000 notes (performance constraint)
  - Example valid: "do re mi fa sol la si do"
  - Example invalid: "da di de" (invalid syllables)

- **key**:
  - Must be one of: C, C#, D, Eb, E, F, F#, G, Ab, A, Bb, B
  - Default: C major
  - Case-insensitive, normalized to uppercase

- **share_id**:
  - Auto-generated on creation using URL-safe characters
  - 12 characters: [A-Za-z0-9_-]
  - Globally unique across all melodies
  - Immutable after creation

### Computed Fields

- **note_count**:
  - Calculation: `len(notation.split())`
  - Cached in database for performance
  - Recalculated on notation update

- **duration_seconds**:
  - Calculation: `note_count * 0.5` (0.5 seconds per quarter note)
  - Cached in database
  - Recalculated on notation update

### Business Rules

- Anonymous compositions are not persisted (client-side only until saved)
- Only authenticated users can save melodies (`user_id` is set on save)
- Users can only edit/delete their own melodies
- Public melodies are accessible via share link without authentication
- Private melodies (`is_public=False`) require authentication and ownership
- Melody deletion is permanent (no soft delete for melodies)
- Transposition does not modify notation, only affects playback

### Indexes

- Primary: `id` (UUID)
- Unique: `share_id` (for public access)
- Foreign Key: `user_id` (for user's melody list)
- Query: `user_id + created_at` (composite, for sorted user melodies)
- Query: `created_at` (for recent melodies analytics)

### State Transitions

```
┌──────────────┐
│  Anonymous   │  User composes without account
│ Composition  │  (client-side only, no database record)
└──────┬───────┘
       │
       │ User clicks "Save" → Prompted to register/login
       ▼
┌──────────────┐
│    Saved     │  Melody persisted with user_id
│   Melody     │  share_id generated
└──────┬───────┘
       │
       ├──────► Edit: Update notation/title/key
       │        (user must be author)
       │
       ├──────► Share: Access via /shared/{share_id}
       │        (public, no auth required)
       │
       └──────► Delete: Permanent removal
                (user must be author)
```

---

## Database Schema (PostgreSQL DDL)

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,  -- bcrypt hash
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Case-insensitive unique indexes
CREATE UNIQUE INDEX idx_users_username_lower ON users (LOWER(username));
CREATE UNIQUE INDEX idx_users_email_lower ON users (LOWER(email));

-- Melodies table
CREATE TABLE melodies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    notation TEXT NOT NULL,
    key VARCHAR(3) DEFAULT 'C',
    share_id VARCHAR(12) UNIQUE NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    note_count INTEGER NOT NULL,
    duration_seconds REAL NOT NULL,
    
    CONSTRAINT chk_notation_not_empty CHECK (LENGTH(TRIM(notation)) > 0),
    CONSTRAINT chk_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
    CONSTRAINT chk_key_valid CHECK (key IN (
        'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'
    ))
);

-- Indexes for query performance
CREATE INDEX idx_melodies_user_created ON melodies (user_id, created_at DESC);
CREATE INDEX idx_melodies_created ON melodies (created_at DESC);
CREATE UNIQUE INDEX idx_melodies_share_id ON melodies (share_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_melodies_updated_at
    BEFORE UPDATE ON melodies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## Django Models (Pseudocode Reference)

```python
# backend/users/models.py
class User(AbstractBaseUser):
    id = UUIDField(primary_key=True, default=uuid4)
    username = CharField(max_length=150, unique=True)
    email = EmailField(unique=True)
    password = CharField(max_length=128)  # Hashed
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    is_active = BooleanField(default=True)
    
    class Meta:
        db_table = 'users'
        indexes = [
            Index(fields=['created_at']),
        ]

# backend/melodies/models.py
class Melody(Model):
    id = UUIDField(primary_key=True, default=uuid4)
    user = ForeignKey(User, on_delete=SET_NULL, null=True, related_name='melodies')
    title = CharField(max_length=200)
    notation = TextField()
    key = CharField(max_length=3, default='C')
    share_id = CharField(max_length=12, unique=True)
    is_public = BooleanField(default=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    note_count = IntegerField()
    duration_seconds = FloatField()
    
    def save(self, *args, **kwargs):
        # Auto-generate share_id if not set
        if not self.share_id:
            self.share_id = generate_share_id()
        
        # Compute note_count and duration
        self.note_count = len(self.notation.split())
        self.duration_seconds = self.note_count * 0.5
        
        super().save(*args, **kwargs)
    
    class Meta:
        db_table = 'melodies'
        ordering = ['-created_at']
        indexes = [
            Index(fields=['user', '-created_at']),
            Index(fields=['share_id']),
        ]
```

---

## Data Validation Summary

### User Registration
1. Validate email format (RFC 5322)
2. Check username uniqueness (case-insensitive)
3. Check email uniqueness (case-insensitive)
4. Validate password strength (8+ chars, mixed case, number)
5. Hash password with bcrypt (cost 12)

### Melody Creation
1. Validate title non-empty (1-200 chars)
2. Parse and validate notation:
   - Split by spaces/commas
   - Check each syllable in [do, re, mi, fa, sol, la, si]
   - Reject invalid syllables with helpful error message
3. Validate key in supported list
4. Generate unique share_id (retry on collision)
5. Compute note_count and duration_seconds
6. Require authentication (user_id must be set)

### Melody Update
1. Verify ownership (user_id matches authenticated user)
2. Re-validate notation if changed
3. Recompute note_count and duration if notation changed
4. Update updated_at timestamp

### Melody Deletion
1. Verify ownership (user_id matches authenticated user)
2. Permanently delete record (no soft delete)

---

## Future Enhancements (Out of Scope for v1)

- **Melody Versioning**: Track edit history for melodies
- **Collaborators**: Allow multiple users to edit shared melodies
- **Tags/Categories**: Organize melodies by genre, mood, difficulty
- **Favorites**: Users can favorite other users' public melodies
- **Comments**: Discussion threads on public melodies
- **Play Count**: Track how many times melody is played
- **Rhythm Notation**: Support for different note durations (whole, half, quarter, eighth)
- **Octave Notation**: Support for "do+" (higher octave), "do-" (lower octave)
- **Export Formats**: MIDI, MusicXML, PDF sheet music
