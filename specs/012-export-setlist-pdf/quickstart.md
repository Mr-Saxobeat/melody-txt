# Quickstart: Export Setlist to PDF

## Prerequisites

- Node.js (existing project setup)
- Running frontend dev server (`npm start` in `frontend/`)

## New Dependencies

```bash
cd frontend
npm install jspdf jszip
```

## Key Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/services/pdfExportService.js` | Create | Core PDF generation and ZIP bundling logic |
| `frontend/src/services/pdfExportService.test.js` | Create | Unit tests for export service |
| `frontend/src/pages/SetlistDetailPage.js` | Modify | Add "Export PDF" button |
| `frontend/src/pages/SetlistDetailPage.test.js` | Modify | Test export button behavior |

## Development Flow

1. Install dependencies (`jspdf`, `jszip`)
2. Create `pdfExportService.js` with:
   - `exportSetlistToPdf(setlist, melodies)` — main entry point
   - `generatePdfForInstrument(instrument, melodies, setlistTitle)` — per-instrument PDF
   - `renderNotationPage(doc, notation, ...)` — per-page rendering with colors
3. Add "Export PDF" button to `SetlistDetailPage`
4. Wire button to fetch all melody data → call export service
5. Test with setlists of varying sizes

## Testing

```bash
cd frontend
npm test -- --watchAll=false --coverage
```

## Verification

1. Open a setlist with 3+ melodies having multiple instrument tabs
2. Click "Export PDF"
3. Verify ZIP downloads with one PDF per instrument
4. Open each PDF: one page per melody, correct colors, hidden notes in muted style
5. Print a PDF: verify readability on paper
