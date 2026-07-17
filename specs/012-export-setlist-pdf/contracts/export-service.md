# Contract: PDF Export Service

## Module Interface

### `exportSetlistToPdf(setlist, melodies)`

Generates a ZIP file containing one PDF per instrument and triggers browser download.

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| setlist | `{ title: string, entries: SetlistEntry[] }` | The setlist metadata |
| melodies | `MelodyData[]` | Full melody data (with tabs), ordered by setlist position |

**Returns**: `Promise<void>` — resolves after download is triggered.

**Behavior**:
1. Identify all unique instruments across all melody tabs
2. For each instrument, generate a PDF with one page per melody
3. Bundle all PDFs into a ZIP file named `[Setlist Title].zip`
4. Trigger browser download of the ZIP

**Error cases**:
- If no melodies have tabs → generates one PDF with placeholder pages
- If fetch fails during melody loading → throws with user-friendly message

---

### `generatePdfForInstrument(instrument, melodies, setlistTitle)`

Generates a single PDF document for one instrument.

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| instrument | `string` | Instrument ID (e.g., 'piano', 'saxophone') |
| melodies | `MelodyData[]` | Ordered melody data |
| setlistTitle | `string` | Used for filename |

**Returns**: `Promise<Blob>` — PDF file as a Blob.

**Per-page rendering**:
- Find the tab matching `instrument` in the melody's tabs
- If no matching tab: render a page with "No notation available for [Instrument]"
- If tab found: parse notation → classify lines → split into render segments → render with colors

---

### `renderNotationPage(doc, notation, pageWidth, pageHeight, margins)`

Renders a single melody's notation onto the current PDF page.

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| doc | `jsPDF` | The jsPDF document instance |
| notation | `string` | Raw notation text |
| pageWidth | `number` | Page width in mm |
| pageHeight | `number` | Page height in mm |
| margins | `{ top, bottom, left, right }` | Margins in mm |

**Behavior**:
- Classify lines using `classifyLines()`
- For each line, split into segments using `renderLineForView()`
- Render each segment with appropriate color and font weight
- If content exceeds available height, reduce font size and re-render (minimum 8pt)

---

## UI Integration Point

### SetlistDetailPage — Export Button

**Placement**: In the page header action buttons (alongside Share, Add Melody).

**Visibility**: Only shown when:
- User is authenticated (not read-only view)
- Setlist has at least one entry

**States**:
- Default: "Export PDF" button
- Loading: "Exporting..." with disabled state
- Error: Toast/inline message with retry option
