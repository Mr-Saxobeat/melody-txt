# Implementation Plan: Multi-Instrument Notation

**Branch**: `004-multi-instruments` | **Date**: 2026-05-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/004-multi-instruments/spec.md`

## Summary

Add multi-instrument tabs to melodies so musicians can have transposed notation for different instruments (Saxophone Eb, Trumpet Bb, Trombone C) alongside the base notation. Each tab stores its own notation independently. Transposition between any two instruments is computed via concert pitch. Setlist navigation remembers the selected instrument tab.

## Technical Context

**Language/Version**:
- Backend: Python 3.11+ (Django 4.2, DRF)
- Frontend: JavaScript ES2022+ (React 18)

**Primary Dependencies**:
- Backend: Django REST Framework (existing), existing transposer utils
- Frontend: React (existing), existing transposer.js and noteParser.js

**Storage**: PostgreSQL 15 (existing — new MelodyTab table, Instrument as hardcoded constants)

**Testing**: pytest (backend), Jest (frontend) — existing

**Target Platform**: Modern web browsers + mobile

**Constraints**:
- Max 10 tabs per melody
- Fixed instrument list (no CRUD): Piano C (0), Saxophone Eb (+9), Trumpet Bb (+2), Trombone C (0)
- Transposition via concert pitch intermediate
- Backward compatible: existing melodies get a single "Piano in C" tab

**Scale/Scope**: New DB table (MelodyTab), modified melody serializers, new frontend tab UI component

## Constitution Check

**Test Coverage Mandate**:
- [x] Plan includes 60%+ test coverage strategy
- [x] Unit test approach defined for all components
- [x] Integration test scenarios identified

**Test-First Development**:
- [x] Testing framework selected and documented
- [x] Test structure aligned with TDD workflow

**Clean Code Principles**:
- [x] Naming conventions defined
- [x] Code organization follows single responsibility
- [x] Maximum function length guidelines established

**OOP Design Principles**:
- [x] Architecture demonstrates SOLID principles
- [x] Interfaces and abstractions properly identified
- [x] Inheritance vs composition strategy documented

**Human-Readable Code**:
- [x] Naming conventions prioritize clarity
- [x] Complex algorithms include documentation
- [x] Code review checklist includes readability verification

## Project Structure

```text
backend/
├── melodies/
│   ├── models.py              # MODIFIED: add MelodyTab model
│   ├── utils.py               # MODIFIED: add instrument transposition helpers
│   └── migrations/            # NEW migration
├── api/
│   ├── serializers.py         # MODIFIED: add MelodyTabSerializer, nested tabs in MelodySerializer
│   ├── views.py               # MODIFIED: tab CRUD endpoints
│   └── urls.py                # MODIFIED: tab routes

frontend/src/
├── components/
│   └── InstrumentTabs.js      # NEW: tab bar + instrument selector modal
├── pages/
│   ├── ComposerPage.js        # MODIFIED: integrate tabs
│   └── SharedMelodyPage.js    # MODIFIED: read-only tab switching + setlist instrument memory
├── utils/
│   └── instruments.js         # NEW: instrument definitions + transposition helpers
```
