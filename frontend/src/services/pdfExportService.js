import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { classifyLines } from '../utils/validation';
import { renderLineForView } from '../utils/hiddenNotes';

const COLOR_MAP = {
  notes: { visible: [46, 125, 50], hidden: [188, 193, 188] },
  lyrics: { visible: [230, 81, 0], hidden: [255, 171, 145] },
  empty: { visible: [51, 51, 51], hidden: [153, 153, 153] },
};

const DEFAULT_FONT_SIZE = 14;
const MIN_FONT_SIZE = 8;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGINS = { top: 15, bottom: 15, left: 15, right: 15 };

function sanitizeFilename(name) {
  return name.replace(/[/\\:*?"<>|]/g, '_');
}

export function renderNotationPage(doc, notation, pageWidth, pageHeight, margins) {
  const availableWidth = pageWidth - margins.left - margins.right;
  const availableHeight = pageHeight - margins.top - margins.bottom;
  const lines = classifyLines(notation);

  let fontSize = DEFAULT_FONT_SIZE;
  let fits = false;

  while (!fits) {
    const totalHeight = calculateContentHeight(doc, lines, fontSize, availableWidth);
    if (totalHeight <= availableHeight || fontSize <= MIN_FONT_SIZE) {
      fits = true;
    } else {
      fontSize = Math.max(MIN_FONT_SIZE, fontSize - 0.5);
    }
  }

  let y = margins.top;
  const lineHeight = fontSize * 0.5;

  for (const line of lines) {
    if (line.type === 'empty') {
      y += lineHeight;
      continue;
    }

    const segments = renderLineForView(line.text, line.type);
    let x = margins.left;

    for (const seg of segments) {
      const colorSet = COLOR_MAP[line.type] || COLOR_MAP.lyrics;
      const [r, g, b] = seg.hidden ? colorSet.hidden : colorSet.visible;
      const fontWeight = seg.hidden ? 'normal' : 'bold';

      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', fontWeight);
      doc.setFontSize(fontSize);

      const textWidth = doc.getStringUnitWidth(seg.text) * fontSize / doc.internal.scaleFactor;
      doc.text(seg.text, x, y);
      x += textWidth;
    }

    y += lineHeight;
  }
}

function calculateContentHeight(doc, lines, fontSize, availableWidth) {
  const lineHeight = fontSize * 0.5;
  return lines.length * lineHeight;
}

export async function generatePdfForInstrument(instrument, melodies, setlistTitle, { createDoc } = {}) {
  const doc = createDoc ? createDoc() : new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  for (let i = 0; i < melodies.length; i++) {
    if (i > 0) {
      doc.addPage();
    }

    const melody = melodies[i];
    const tab = melody.tabs ? melody.tabs.find((t) => t.instrument === instrument) : null;

    if (tab && tab.notation) {
      renderNotationPage(doc, tab.notation, PAGE_WIDTH, PAGE_HEIGHT, MARGINS);
    } else {
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      const instrumentName = instrument.charAt(0).toUpperCase() + instrument.slice(1);
      doc.text(`No notation available for ${instrumentName}`, MARGINS.left, PAGE_HEIGHT / 2);
      if (melody.title) {
        doc.setTextColor(51, 51, 51);
        doc.setFont('helvetica', 'bold');
        doc.text(melody.title, MARGINS.left, MARGINS.top + 10);
      }
    }
  }

  return doc.output('blob');
}

export async function exportSetlistToPdf(setlist, melodies, { createDoc, createZip } = {}) {
  const allInstruments = new Set();
  for (const melody of melodies) {
    if (melody.tabs) {
      for (const tab of melody.tabs) {
        allInstruments.add(tab.instrument);
      }
    }
  }

  const instruments = Array.from(allInstruments);
  const zip = createZip ? createZip() : new JSZip();
  const safeTitle = sanitizeFilename(setlist.title);

  for (const instrument of instruments) {
    const pdfBlob = await generatePdfForInstrument(instrument, melodies, setlist.title, { createDoc });
    const instrumentName = instrument.charAt(0).toUpperCase() + instrument.slice(1);
    const filename = `${safeTitle} - ${instrumentName}.pdf`;
    zip.file(filename, pdfBlob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeTitle}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
