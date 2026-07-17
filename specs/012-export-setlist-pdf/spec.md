# Feature Specification: Export Setlist to PDF

**Feature Branch**: `012-export-setlist-pdf`  
**Created**: 2026-07-17  
**Status**: Draft  
**Input**: User description: "Export setlists to PDF. Each melody on one page. Font style, size, line format same as shared melody. One file per instrument."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Export a setlist as PDF for a single instrument (Priority: P1)

A musician viewing their setlist wants to export it as a PDF so they can print or view it offline during a rehearsal or performance. They select the export option, choose an instrument, and receive a PDF file where each melody occupies exactly one page, rendered with the same visual styling (font, colors, layout) as the shared melody view.

**Why this priority**: This is the core value of the feature — producing a printable/offline-ready document that musicians can use during live performance without needing the app.

**Independent Test**: Can be fully tested by exporting a setlist with 3+ melodies for one instrument and verifying the PDF has one melody per page with correct styling.

**Acceptance Scenarios**:

1. **Given** a setlist with 5 melodies, **When** the user exports for "Piano", **Then** a PDF file is generated with exactly 5 pages, one melody per page.
2. **Given** a setlist with melodies containing notes and lyrics, **When** the PDF is generated, **Then** notes appear in green (#2e7d32), lyrics in orange (#e65100), and section headers in dark gray (#333), matching the shared melody view.
3. **Given** a melody with instrument-specific notation (tabs), **When** exporting for a specific instrument, **Then** the PDF renders the notation for that instrument's tab.

---

### User Story 2 - Export produces one file per instrument (Priority: P1)

A band leader has a setlist with melodies arranged for multiple instruments (e.g., Piano, Saxophone, Trumpet). When they export, the system produces a separate PDF file for each instrument that has notation in the setlist, so each musician gets their own part.

**Why this priority**: This is a core requirement — the export must produce per-instrument files so musicians only see their own part.

**Independent Test**: Can be tested by exporting a setlist whose melodies have 3 instrument tabs and verifying 3 separate PDF files are produced.

**Acceptance Scenarios**:

1. **Given** a setlist where all melodies have Piano, Saxophone, and Trumpet tabs, **When** the user exports, **Then** 3 PDF files are generated (one for each instrument).
2. **Given** a setlist where some melodies lack a specific instrument tab, **When** exporting, **Then** the PDF for that instrument shows a blank page or a placeholder message for melodies without that instrument's notation.
3. **Given** the export produces multiple files, **When** the download completes, **Then** the user receives a single ZIP archive containing each PDF clearly named with the setlist title and instrument name (e.g., "My Setlist - Saxophone.pdf").

---

### User Story 3 - PDF preserves content layout per page (Priority: P2)

Each page in the exported PDF renders the melody content exactly as displayed in the shared melody view. The melody title is already present as the first row of the content — no additional header is added.

**Why this priority**: Consistent rendering ensures musicians see the same layout they practiced with online.

**Independent Test**: Can be tested by comparing a PDF page side-by-side with the shared melody view and verifying identical content and layout.

**Acceptance Scenarios**:

1. **Given** a melody whose content starts with the title in the first row, **When** rendered in the PDF, **Then** the content is rendered as-is without an additional separate title header.
2. **Given** a melody with notation that fits on one page, **When** rendered, **Then** the content is vertically positioned with appropriate margins and does not overflow to a second page.
3. **Given** a setlist with melodies in a specific order, **When** the PDF is generated, **Then** pages follow the same order as the setlist entries.

---

### Edge Cases

- What happens when a melody's notation is too long to fit on a single page? The content is scaled down (reduced font size) to fit within one page.
- What happens when a melody has no notation for the target instrument? A page is still generated with the melody title and a message indicating no notation is available for that instrument.
- What happens when a setlist is empty (no entries)? The export option is disabled or shows a message that there are no melodies to export.
- What happens when hidden notes are present? Hidden notes are included in the PDF with the same muted/lighter color styling as the shared melody view (lighter gray for notes, lighter orange for lyrics).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to initiate a PDF export from the setlist detail page.
- **FR-002**: System MUST generate one PDF file per instrument that has notation across the setlist's melodies.
- **FR-003**: Each page in the PDF MUST contain exactly one melody's notation.
- **FR-004**: The PDF MUST render notation with the same font style (weight 600), color coding (notes: #2e7d32, lyrics: #e65100, other: #333), and line formatting (pre-wrap whitespace) as the shared melody view. Hidden notes MUST be included with the same muted color styling used in the shared melody view (muted green for hidden notes, muted orange for hidden lyrics, weight 400).
- **FR-005**: Each PDF page MUST render the melody content as-is (the title is already the first row of the content; no additional header is added).
- **FR-006**: The PDF pages MUST follow the same order as the setlist entries.
- **FR-007**: Each generated PDF file MUST be named using the pattern "[Setlist Title] - [Instrument Name].pdf" and delivered within a single ZIP archive named "[Setlist Title].zip".
- **FR-008**: System MUST scale content to fit within a single page when notation is longer than the available space.
- **FR-009**: System MUST generate a page with a "no notation available" message for melodies that lack a tab for the target instrument.
- **FR-010**: System MUST disable the export action when the setlist has no entries.

### Key Entities

- **Setlist**: An ordered collection of melody entries belonging to a user. Has a title and a list of entries.
- **Setlist Entry**: A reference to a melody within a setlist, defining order (position) and linking to the melody's share ID and title.
- **Melody Tab**: An instrument-specific notation within a melody. Each melody can have multiple tabs for different instruments (e.g., Piano, Saxophone, Trumpet, Trombone).
- **PDF Document**: The generated output file containing one page per melody, scoped to a single instrument.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can export a setlist to PDF in under 5 seconds for setlists with up to 30 melodies.
- **SC-002**: 100% of exported PDFs have exactly one melody per page matching the setlist entry count.
- **SC-003**: The visual appearance of notation in the PDF is indistinguishable from the shared melody view when compared side-by-side at the same scale.
- **SC-004**: Users receive a single ZIP download containing one clearly-named PDF per instrument present in the setlist.
- **SC-005**: Exported PDFs are readable and properly formatted when printed on standard paper (A4 or Letter).

## Clarifications

### Session 2026-07-17

- Q: Should the PDF add a separate title header on each page? → A: No. The melody content already contains the title as its first row; render content as-is without an additional header.
- Q: How should multiple PDF files be delivered to the user? → A: As a single ZIP file containing all instrument PDFs.
- Q: Should hidden notes be included in the PDF? → A: Yes. Hidden notes are included with the same muted/lighter color as displayed on the shared melody page.

## Assumptions

- Users have a modern browser that supports client-side PDF generation (no server-side rendering required).
- The export targets the current state of the setlist (no historical versions).
- The PDF is generated and downloaded directly in the browser — no email delivery or cloud storage.
- The font size used in the PDF matches the default shared melody view size (1.1rem equivalent), not any user-customized size from the current session.
- Transpose state is not applied to the PDF — melodies are exported in their original key as stored.
- The feature is available to authenticated users who own the setlist (not from the shared/read-only view).
