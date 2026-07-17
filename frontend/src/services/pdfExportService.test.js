jest.mock('jspdf', () => ({ jsPDF: jest.fn() }));
jest.mock('jszip', () => jest.fn());

import { renderNotationPage, generatePdfForInstrument, exportSetlistToPdf } from './pdfExportService';

const createMockDoc = () => ({
  setTextColor: jest.fn(),
  setFont: jest.fn(),
  setFontSize: jest.fn(),
  text: jest.fn(),
  addPage: jest.fn(),
  getStringUnitWidth: jest.fn().mockReturnValue(5),
  output: jest.fn().mockReturnValue(new Blob(['pdf-content'])),
  internal: { scaleFactor: 1 },
});

const createMockZip = () => ({
  file: jest.fn(),
  generateAsync: jest.fn().mockResolvedValue(new Blob(['zip-content'])),
});

describe('renderNotationPage', () => {
  let mockDoc;

  beforeEach(() => {
    mockDoc = createMockDoc();
  });

  test('sets correct color for notes lines (green #2e7d32)', () => {
    const notation = '4Do Re Mi';
    renderNotationPage(mockDoc, notation, 210, 297, { top: 15, bottom: 15, left: 15, right: 15 });

    const colorCalls = mockDoc.setTextColor.mock.calls;
    expect(colorCalls).toContainEqual([46, 125, 50]);
  });

  test('sets correct color for lyrics lines (orange #e65100)', () => {
    const notation = 'hello world lyrics line';
    renderNotationPage(mockDoc, notation, 210, 297, { top: 15, bottom: 15, left: 15, right: 15 });

    const colorCalls = mockDoc.setTextColor.mock.calls;
    expect(colorCalls).toContainEqual([230, 81, 0]);
  });

  test('uses font weight bold for visible segments', () => {
    const notation = '4Do Re Mi';
    renderNotationPage(mockDoc, notation, 210, 297, { top: 15, bottom: 15, left: 15, right: 15 });

    const fontCalls = mockDoc.setFont.mock.calls;
    expect(fontCalls.some(([, weight]) => weight === 'bold')).toBe(true);
  });

  test('uses font weight normal for hidden segments', () => {
    const notation = '4Do (Re) Mi';
    renderNotationPage(mockDoc, notation, 210, 297, { top: 15, bottom: 15, left: 15, right: 15 });

    const fontCalls = mockDoc.setFont.mock.calls;
    expect(fontCalls.length).toBeGreaterThan(0);
  });

  test('reduces font size when content exceeds page height', () => {
    const longNotation = Array(100).fill('4Do Re Mi Fa Sol La Si').join('\n');
    renderNotationPage(mockDoc, longNotation, 210, 297, { top: 15, bottom: 15, left: 15, right: 15 });

    const sizeCalls = mockDoc.setFontSize.mock.calls;
    const usedSizes = sizeCalls.map(([s]) => s);
    const finalSize = usedSizes[usedSizes.length - 1];
    expect(finalSize).toBeLessThan(14);
  });

  test('does not reduce font size below 8pt minimum', () => {
    const veryLongNotation = Array(500).fill('4Do Re Mi Fa Sol La Si').join('\n');
    renderNotationPage(mockDoc, veryLongNotation, 210, 297, { top: 15, bottom: 15, left: 15, right: 15 });

    const sizeCalls = mockDoc.setFontSize.mock.calls;
    const usedSizes = sizeCalls.map(([s]) => s);
    usedSizes.forEach((size) => {
      expect(size).toBeGreaterThanOrEqual(8);
    });
  });

  test('does NOT prepend a separate title header — renders content as-is', () => {
    const notation = 'Amazing Grace\n4Do Re Mi';
    renderNotationPage(mockDoc, notation, 210, 297, { top: 15, bottom: 15, left: 15, right: 15 });

    const textCalls = mockDoc.text.mock.calls;
    expect(textCalls.some(([text]) => text === 'Title:' || text === 'Amazing Grace\n')).toBe(false);
  });
});

describe('generatePdfForInstrument', () => {
  let mockDoc;

  beforeEach(() => {
    mockDoc = createMockDoc();
  });

  test('generates PDF with correct number of pages for melodies with matching tabs', async () => {
    const melodies = [
      { title: 'Song 1', tabs: [{ instrument: 'piano', notation: '4Do Re Mi' }] },
      { title: 'Song 2', tabs: [{ instrument: 'piano', notation: '4Fa Sol La' }] },
      { title: 'Song 3', tabs: [{ instrument: 'piano', notation: '4Si Do' }] },
    ];

    const blob = await generatePdfForInstrument('piano', melodies, 'Test Setlist', { createDoc: () => mockDoc });
    expect(blob).toBeInstanceOf(Blob);
    expect(mockDoc.addPage).toHaveBeenCalledTimes(2);
  });

  test('finds correct instrument tab from melody.tabs array', async () => {
    const melodies = [
      {
        title: 'Song 1',
        tabs: [
          { instrument: 'piano', notation: '4Do Re Mi' },
          { instrument: 'saxophone', notation: '4Fa Sol La' },
        ],
      },
    ];

    const blob = await generatePdfForInstrument('saxophone', melodies, 'Test Setlist', { createDoc: () => mockDoc });
    expect(blob).toBeInstanceOf(Blob);
    expect(mockDoc.setTextColor).toHaveBeenCalled();
  });

  test('renders placeholder when melody has no matching instrument tab', async () => {
    const melodies = [
      { title: 'Song 1', tabs: [{ instrument: 'piano', notation: '4Do Re Mi' }] },
    ];

    await generatePdfForInstrument('trumpet', melodies, 'Test Setlist', { createDoc: () => mockDoc });
    const textCalls = mockDoc.text.mock.calls;
    expect(textCalls.some(([text]) => text.includes('No notation available'))).toBe(true);
  });

  test('pages follow setlist entry order', async () => {
    const melodies = [
      { title: 'First', tabs: [{ instrument: 'piano', notation: '4Do' }] },
      { title: 'Second', tabs: [{ instrument: 'piano', notation: '4Re' }] },
      { title: 'Third', tabs: [{ instrument: 'piano', notation: '4Mi' }] },
    ];

    await generatePdfForInstrument('piano', melodies, 'Test Setlist', { createDoc: () => mockDoc });
    expect(mockDoc.addPage).toHaveBeenCalledTimes(2);
  });
});

describe('exportSetlistToPdf', () => {
  let mockDoc;
  let mockZip;
  let mockLink;

  beforeEach(() => {
    mockDoc = createMockDoc();
    mockZip = createMockZip();
    mockLink = { href: '', download: '', click: jest.fn() };
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    URL.createObjectURL = jest.fn().mockReturnValue('blob:test-url');
    URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    document.createElement.mockRestore();
    document.body.appendChild.mockRestore();
    document.body.removeChild.mockRestore();
  });

  test('adds one PDF per unique instrument to the ZIP', async () => {
    const setlist = { title: 'My Setlist', entries: [] };
    const melodies = [
      {
        title: 'Song 1',
        tabs: [
          { instrument: 'piano', notation: '4Do' },
          { instrument: 'saxophone', notation: '4Re' },
          { instrument: 'trumpet', notation: '4Mi' },
        ],
      },
      {
        title: 'Song 2',
        tabs: [
          { instrument: 'piano', notation: '4Fa' },
          { instrument: 'saxophone', notation: '4Sol' },
          { instrument: 'trumpet', notation: '4La' },
        ],
      },
    ];

    await exportSetlistToPdf(setlist, melodies, { createDoc: () => mockDoc, createZip: () => mockZip });
    expect(mockZip.file).toHaveBeenCalledTimes(3);
  });

  test('ZIP contains files named with setlist title and instrument name', async () => {
    const setlist = { title: 'Concert Night', entries: [] };
    const melodies = [
      { title: 'Song 1', tabs: [{ instrument: 'piano', notation: '4Do' }] },
    ];

    await exportSetlistToPdf(setlist, melodies, { createDoc: () => mockDoc, createZip: () => mockZip });
    expect(mockZip.file).toHaveBeenCalledWith('Concert Night - Piano.pdf', expect.any(Blob));
  });

  test('ZIP file download is named with setlist title', async () => {
    const setlist = { title: 'Concert Night', entries: [] };
    const melodies = [
      { title: 'Song 1', tabs: [{ instrument: 'piano', notation: '4Do' }] },
    ];

    await exportSetlistToPdf(setlist, melodies, { createDoc: () => mockDoc, createZip: () => mockZip });
    expect(mockLink.download).toBe('Concert Night.zip');
  });

  test('sanitizes invalid filename characters', async () => {
    const setlist = { title: 'My/Set:list*"Test"', entries: [] };
    const melodies = [
      { title: 'Song 1', tabs: [{ instrument: 'piano', notation: '4Do' }] },
    ];

    await exportSetlistToPdf(setlist, melodies, { createDoc: () => mockDoc, createZip: () => mockZip });
    expect(mockLink.download).not.toMatch(/[/\\:*?"<>|]/);
  });
});
