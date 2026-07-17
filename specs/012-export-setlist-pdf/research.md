# Research: Export Setlist to PDF

## Decision 1: PDF Generation Library

**Decision**: Use `jsPDF` with manual text rendering for client-side PDF generation.

**Rationale**:
- `jsPDF` is lightweight (~300KB gzipped), well-maintained, and has no server dependency.
- Manual text rendering (using `doc.text()` with color/font control) gives precise control over font weight, color per segment (notes vs lyrics vs hidden), and line wrapping — matching the exact shared melody view styling.
- Alternative `html2canvas` + `jsPDF` approach would capture DOM screenshots but produces raster images (blurry when printed, larger file sizes, no text selection in PDF).
- Alternative `react-pdf/renderer` is heavier and designed for complex layouts — overkill for monospace text rendering.
- `jsPDF` supports setting text color per call (`doc.setTextColor(r, g, b)`), font weight (`doc.setFont(name, style)`), and precise positioning — perfect for rendering colored notation segments line by line.

**Alternatives considered**:
- `html2canvas` + `jsPDF`: Rasterizes DOM → blurry on print, no text selection, larger files. Rejected.
- `@react-pdf/renderer`: Too heavy, React-specific rendering pipeline, harder to match exact pixel styling. Rejected.
- `pdfmake`: Good for structured docs but less control over per-character coloring. Rejected.
- Server-side (WeasyPrint/Puppeteer): Adds infrastructure complexity, latency; feature is simple enough for client-side. Rejected.

## Decision 2: ZIP Archive Library

**Decision**: Use `JSZip` for bundling multiple PDF files into a single ZIP download.

**Rationale**:
- `JSZip` is the de facto standard for client-side ZIP generation in JavaScript (~45KB gzipped).
- Simple API: `zip.file(name, blob)` then `zip.generateAsync({type: 'blob'})`.
- Well-maintained, widely used, and compatible with all modern browsers.
- Combined with `FileSaver.js` (or a simple `URL.createObjectURL` + anchor click pattern) for triggering the download.

**Alternatives considered**:
- `archiver`: Node.js only, not suitable for browser. Rejected.
- Manual ZIP construction: Unnecessarily complex, error-prone. Rejected.
- Downloading individual files sequentially: Blocked by browser popup blockers, poor UX. Rejected.

## Decision 3: Content Scaling Strategy

**Decision**: Auto-reduce font size to fit melody content within one page.

**Rationale**:
- The spec requires each melody to fit on exactly one page. Most melodies are short enough at default size.
- Strategy: Start at default font size, calculate total content height, if it exceeds page height reduce font size proportionally until it fits (minimum 8pt to remain readable).
- `jsPDF` allows measuring text dimensions via `doc.getTextDimensions()` before rendering.

**Alternatives considered**:
- Truncate long melodies: Loses content, unacceptable. Rejected.
- Overflow to next page: Violates spec requirement of one melody per page. Rejected.
- Fixed small font for all: Hurts readability for short melodies. Rejected.

## Decision 4: Fetching Melody Data for Export

**Decision**: Fetch full melody data (with tabs/notation) via existing shared melody API endpoint for each entry in the setlist.

**Rationale**:
- The setlist entries only contain `melody_share_id` and `melody_title` — not the full notation.
- The existing `melodyService.getSharedMelody(shareId)` returns tabs with instrument-specific notation.
- Fetching all melodies in parallel before generating PDFs keeps the export responsive.
- No new backend API is needed.

**Alternatives considered**:
- New bulk endpoint: Would require backend changes for a feature that's fine with parallel fetches. Over-engineering. Rejected.
- Caching melody data on setlist load: Not available in current architecture; setlist page only shows titles. Rejected.

## Decision 5: File Download Trigger

**Decision**: Use `URL.createObjectURL()` + programmatic anchor click for triggering the ZIP download.

**Rationale**:
- No additional library needed beyond `JSZip`.
- Standard browser pattern: create a blob URL, assign to a hidden `<a>` element with `download` attribute, click it programmatically.
- Works across all modern browsers without popup blockers interfering.
- `FileSaver.js` is an alternative wrapper but adds a dependency for a 5-line utility.

**Alternatives considered**:
- `FileSaver.js`: Adds dependency for trivial functionality. Rejected.
- Opening blob in new tab: Less reliable cross-browser, no filename control. Rejected.
