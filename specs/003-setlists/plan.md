# Implementation Plan: Setlists

**Branch**: `003-setlists` | **Date**: 2026-05-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/003-setlists/spec.md`

## Summary

Add setlist functionality enabling users to organize saved melodies into ordered collections for rehearsal or performance. Includes full CRUD, reordering, inline playback, and sharing via public links. Requires new backend model + API endpoints and new frontend pages.

## Technical Context

**Language/Version**:
- Backend: Python 3.11+ (Django 4.2, Django REST Framework)
- Frontend: JavaScript ES2022+ (React 18)

**Primary Dependencies**:
- Backend: Django REST Framework (existing), simplejwt (existing auth)
- Frontend: React Router (existing), existing MelodyPlayer component

**Storage**: PostgreSQL 15 (existing — new Setlist + SetlistEntry tables)

**Testing**:
- Backend: pytest + pytest-django (existing)
- Frontend: Jest + React Testing Library (existing)

**Target Platform**: Modern web browsers (existing)

**Project Type**: Web application (full-stack SPA with REST API)

**Constraints**:
- Max 50 setlists per user, max 100 melodies per setlist
- Setlists private by default, shared only via explicit link
- Same melody can appear multiple times in a setlist

**Scale/Scope**: Adds 2 new DB tables, ~4 new API endpoints, ~3 new frontend pages

## Constitution Check

**Test Coverage Mandate**:
- [x] Plan includes 60%+ test coverage strategy
- [x] Unit test approach defined for all components
- [x] Integration test scenarios identified

**Test-First Development**:
- [x] Testing framework selected and documented (pytest, Jest — existing)
- [x] Test structure aligned with TDD workflow

**Clean Code Principles**:
- [x] Naming conventions defined (existing project conventions)
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
├── setlists/                    # NEW Django app
│   ├── models.py                # Setlist, SetlistEntry models
│   ├── admin.py                 # Admin registration
│   └── apps.py
├── api/
│   ├── serializers.py           # MODIFIED: add setlist serializers
│   ├── views.py                 # MODIFIED: add setlist viewset
│   └── urls.py                  # MODIFIED: add setlist routes
└── tests/
    ├── unit/test_setlists.py    # NEW
    └── integration/test_api_setlists.py  # NEW

frontend/src/
├── pages/
│   ├── SetlistsPage.js          # NEW: list all setlists
│   ├── SetlistDetailPage.js     # NEW: view/edit single setlist
│   └── SharedSetlistPage.js     # NEW: public shared view
├── services/
│   └── setlistService.js        # NEW: API client
└── components/
    └── Header.js                # MODIFIED: add nav link
```
