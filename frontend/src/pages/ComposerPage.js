import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MelodyComposer from '../components/MelodyComposer';
// import MelodyPlayer from '../components/MelodyPlayer';
import TransposeControls from '../components/TransposeControls';
import InstrumentTabs from '../components/InstrumentTabs';
import InstrumentSelectModal from '../components/InstrumentSelectModal';
import FlatToggle from '../components/FlatToggle';
import { useAuth } from '../hooks/useAuth';
import melodyService from '../services/melodyService';
import { transposeNotes } from '../utils/transposer';
import { INSTRUMENTS, transposeForInstrument } from '../utils/instruments';
import './ComposerPage.css';

function ComposerPage() {
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [preferFlat, setPreferFlat] = useState(() => localStorage.getItem('preferFlat') === 'true');
  const [editingId, setEditingId] = useState(null);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [sourceInstrument, setSourceInstrument] = useState(null);
  const [originalTabs, setOriginalTabs] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const notation = activeTab ? activeTab.notation : '';

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && isAuthenticated) {
      melodyService.getMelody(editId).then((melody) => {
        setTitle(melody.title);
        setEditingId(melody.id);
        setShowSourceModal(false);
        if (melody.tabs && melody.tabs.length > 0) {
          setTabs(melody.tabs);
          setActiveTabId(melody.tabs[0].id);
          setSourceInstrument(melody.tabs[0].instrument);
        } else {
          const defaultTab = { id: 'local-0', instrument: 'piano', notation: melody.notation, position: 0, suffix: null };
          setTabs([defaultTab]);
          setActiveTabId('local-0');
          setSourceInstrument('piano');
        }
      }).catch(() => {});
    } else {
      setTabs((prev) => {
        if (prev.length > 0) return prev;
        setShowSourceModal(true);
        return [];
      });
    }
  }, [searchParams, isAuthenticated]);

  const updateActiveNotation = (newNotation) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, notation: newNotation } : t))
    );
    setSaveSuccess(false);
  };

  const handleValidationChange = (valid) => {
    setIsValid(valid);
  };

  const handleTabSelect = (tabId) => {
    if (sourceInstrument && activeTab && activeTab.instrument === sourceInstrument && activeTab.notation && activeTab.notation.trim()) {
      setTabs((prev) => prev.map((t) => {
        if (t.id === activeTab.id) return t;
        if (t.notation && t.notation.trim()) return t;
        const transposed = transposeForInstrument(activeTab.notation, sourceInstrument, t.instrument, !preferFlat);
        return { ...t, notation: transposed };
      }));
    }
    setActiveTabId(tabId);
  };

  const handleSourceDismiss = () => {
    setShowSourceModal(false);
  };

  const handleSourceSelect = (instrumentId) => {
    setSourceInstrument(instrumentId);
    setShowSourceModal(false);
    const newTabs = INSTRUMENTS.map((inst, i) => ({
      id: `local-${i}`,
      instrument: inst.id,
      notation: '',
      position: i,
      suffix: null,
    }));
    setTabs(newTabs);
    const sourceTab = newTabs.find((t) => t.instrument === instrumentId);
    setActiveTabId(sourceTab ? sourceTab.id : newTabs[0].id);
  };

  const handleFlatToggle = (flat) => {
    setPreferFlat(flat);
    localStorage.setItem('preferFlat', flat ? 'true' : 'false');
  };

  const handleTranspose = (semitones) => {
    if (!originalTabs) {
      setOriginalTabs(tabs.map((t) => ({ ...t })));
    }
    setTabs((prev) =>
      prev.map((t) => ({ ...t, notation: transposeNotes(t.notation, semitones, !preferFlat) }))
    );
  };

  const handleResetTranspose = () => {
    if (originalTabs) {
      setTabs(originalTabs);
      setOriginalTabs(null);
    }
  };

  const handleAddTab = (instrumentId) => {
    if (!sourceInstrument) {
      setSourceInstrument(instrumentId);
    }
    const fromTab = activeTab;
    const fromInstrument = fromTab ? fromTab.instrument : 'piano';
    const fromNotation = fromTab ? fromTab.notation : '';
    const transposed = transposeForInstrument(fromNotation, fromInstrument, instrumentId, !preferFlat);
    const newId = `local-${Date.now()}`;
    const newTab = {
      id: newId,
      instrument: instrumentId,
      notation: transposed,
      position: tabs.length,
      suffix: null,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const handleDeleteTab = (tabId) => {
    if (tabs.length <= 1) return;
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const handleSuffixChange = (tabId, suffix) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, suffix } : t))
    );
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (!editingId && !title) {
      const lines = notation.split('\n');
      const firstLineIdx = lines.findIndex((line) => line.trim());
      if (firstLineIdx >= 0) {
        setTitle(lines[firstLineIdx].trim().slice(0, 200));
      }
    }
    setShowSaveDialog(true);
    setSaveError(null);
  };

  const handleSaveConfirm = async () => {
    if (!title.trim()) {
      setSaveError('Please enter a title.');
      return;
    }

    setSaving(true);
    setSaveError(null);

    let tabsToSave = tabs;
    const srcTab = tabs.find((t) => t.instrument === sourceInstrument);
    if (sourceInstrument && srcTab && srcTab.notation && srcTab.notation.trim()) {
      tabsToSave = tabs.map((t) => {
        if (t.notation && t.notation.trim()) return t;
        const transposed = transposeForInstrument(srcTab.notation, sourceInstrument, t.instrument, !preferFlat);
        return { ...t, notation: transposed };
      });
      setTabs(tabsToSave);
    }

    const sourceTab = tabsToSave.find((t) => t.instrument === sourceInstrument);
    const primaryNotation = sourceTab?.notation || tabsToSave[0]?.notation || '';

    try {
      let melody;
      if (editingId) {
        melody = await melodyService.updateMelody(editingId, {
          title: title.trim(),
          notation: primaryNotation,
          is_public: true,
        });
      } else {
        melody = await melodyService.createMelody(title.trim(), primaryNotation);
      }

      const melodyId = melody.id;

      const savedTabs = [];
      for (let i = 0; i < tabsToSave.length; i++) {
        const t = tabsToSave[i];
        const saved = await melodyService.addTab(
          melodyId,
          t.instrument,
          t.notation,
          i,
          t.instrument,
          t.suffix,
        );
        savedTabs.push(saved);
      }

      const existingTabs = melody.tabs || [];
      for (const et of existingTabs) {
        await melodyService.deleteTab(melodyId, et.id);
      }

      setTabs(savedTabs);
      setActiveTabId(savedTabs[0]?.id || null);
      setEditingId(melodyId);
      setSaving(false);
      setShowSaveDialog(false);
      setSaveSuccess(true);
    } catch (err) {
      setSaving(false);
      setSaveError(err.response?.data?.detail || 'Failed to save melody.');
    }
  };

  return (
    <div className="composer-page">
      {showSourceModal && (
        <InstrumentSelectModal onSelect={handleSourceSelect} onDismiss={handleSourceDismiss} />
      )}
      <div className="composer-container">
        <header className="page-header">
          <h1>Compose Your Melody</h1>
          <div className="info-section">
            <h3>How to use:</h3>
            <ul>
              <li>Type solfege syllables: <strong>do</strong>, <strong>re</strong>, <strong>mi</strong>, <strong>fa</strong>, <strong>sol</strong>, <strong>la</strong>, <strong>si</strong></li>
              <li>Add accidentals with <strong>#</strong> (sharp) or <strong>b</strong> (flat): do#, reb, fa#</li>
              <li>Change octave: <strong>UPPERCASE</strong> = octave up, <strong>lowercase + number</strong> = octave down (DO = C5, do1 = C3)</li>
              <li>Lines with non-note text are treated as <strong>lyrics</strong> (highlighted in orange)</li>
              <li>Symbols like <strong>|</strong>, <strong>:</strong>, <strong>-</strong>, <strong>(</strong>, <strong>)</strong> and numbers are ignored in note lines</li>
              <li>Use transpose buttons to shift all notes up or down</li>
              <li>Add instrument tabs with <strong>+</strong> to see transposed notation for different instruments</li>
            </ul>
          </div>
        </header>

        <div className="composer-section">
          <label className="composer-label">Enter your melody (notes and lyrics):</label>
          {/* <MelodyPlayer notation={notation} disabled={!isValid || !notation} /> */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <TransposeControls
              onTranspose={handleTranspose}
              disabled={!notation}
            />
            <FlatToggle preferFlat={preferFlat} onToggle={handleFlatToggle} />
          </div>
          {originalTabs && (
            <button className="btn-reset-transpose" onClick={handleResetTranspose}>
              Reset
            </button>
          )}
          <InstrumentTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onTabSelect={handleTabSelect}
            onAddTab={handleAddTab}
            onDeleteTab={handleDeleteTab}
            onSuffixChange={handleSuffixChange}
          />
          <MelodyComposer
            notation={notation}
            onChange={updateActiveNotation}
            onValidationChange={handleValidationChange}
          />
          {saveSuccess && (
            <p className="save-success">Melody saved successfully!</p>
          )}
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={!isValid || !notation}
          >
            {isAuthenticated ? 'Save Melody' : 'Save (Login Required)'}
          </button>
        </div>

        {showSaveDialog && (
          <div className="save-dialog-overlay">
            <div className="save-dialog">
              <h3>Save Melody</h3>
              <div className="form-group">
                <label htmlFor="melody-title">Title</label>
                <input
                  id="melody-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your melody"
                  maxLength={200}
                />
              </div>
              {saveError && <p className="form-error">{saveError}</p>}
              <div className="save-dialog-actions">
                <button
                  className="btn-primary"
                  onClick={handleSaveConfirm}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComposerPage;
