# Data Model: Instruments Management

**Date**: 2026-09-18
**Branch**: `014-instruments-management`

## New Entity: Instrument

| Field  | Type             | Constraints                        | Notes                                           |
|--------|------------------|------------------------------------|--------------------------------------------------|
| id     | UUID (PK)        | Auto-generated                     | Consistent with existing Melody/MelodyTab UUIDs  |
| name   | CharField(100)   | Unique, not blank                  | Display name entered by admin                    |
| pitch  | CharField(2)     | Choices: C,Db,D,Eb,E,F,F#,G,Ab,A,Bb,B | Immutable after creation                     |
| offset | IntegerField     | Computed from pitch, read-only     | Formula: (12 - semitone_position) % 12           |

**Table name**: `instruments`
**Ordering**: `name` (alphabetical, per FR-014)

### Pitch-to-Offset Mapping (Fixed)

| Pitch | Offset |
|-------|--------|
| C     | 0      |
| Db    | 11     |
| D     | 10     |
| Eb    | 9      |
| E     | 8      |
| F     | 7      |
| F#    | 6      |
| G     | 5      |
| Ab    | 4      |
| A     | 3      |
| Bb    | 2      |
| B     | 1      |

### Validation Rules

- `name` must be unique (case-sensitive)
- `pitch` must be one of the 12 valid choices
- `offset` is derived automatically from `pitch` — never set by the user
- `pitch` is immutable after creation (enforced at the model/admin level)

## Modified Entity: MelodyTab

| Field      | Current Type          | New Type                         | Notes                                    |
|------------|-----------------------|----------------------------------|------------------------------------------|
| instrument | CharField(20, choices) | ForeignKey(Instrument, CASCADE) | Migrated from string to FK reference     |

All other MelodyTab fields remain unchanged: `id`, `melody`, `notation`, `position`, `suffix`, `created_at`.

### Cascade Behavior

- When an `Instrument` is deleted, all `MelodyTab` rows referencing it are deleted (CASCADE)
- **Exception**: If a melody would lose its last tab, a new Piano tab is created before the cascade runs (FR-011)

## Seed Data (Migration)

The migration must create these four instruments to preserve existing data:

| name       | pitch | offset | Maps from old string |
|------------|-------|--------|----------------------|
| Piano      | C     | 0      | `piano`              |
| Saxophone  | Eb    | 9      | `saxophone`          |
| Trumpet    | Bb    | 2      | `trumpet`            |
| Trombone   | C     | 0      | `trombone`           |

### Migration Steps

1. Create `instruments` table
2. Insert four seed instruments
3. Add nullable FK field `instrument_new` to `melody_tabs`
4. Data migration: map each `instrument` string to the corresponding `Instrument` FK
5. Drop old `instrument` CharField
6. Rename `instrument_new` to `instrument`, set non-nullable

## Entity Relationship Summary

```
Instrument (1) ──────< MelodyTab (N) >────── Melody (1)
   name                   instrument (FK)       title
   pitch                  notation              notation
   offset                 position              key
                          suffix                ...
```
