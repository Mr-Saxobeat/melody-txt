import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import melodyService from '../services/melodyService';
import setlistService from '../services/setlistService';
// import MelodyPlayer from '../components/MelodyPlayer';
import { transposeNotes, convertAccidentals } from '../utils/transposer';
import { classifyLines } from '../utils/validation';
import { getInstrumentById } from '../utils/instruments';
import FlatToggle from '../components/FlatToggle';
import '../components/TransposeControls.css';
import { useAuth } from '../hooks/useAuth';

function SharedMelodyPage() {
  const { shareId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [melody, setMelody] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [transposeSemitones, setTransposeSemitones] = useState(0);
  const [preferFlat, setPreferFlat] = useState(() => localStorage.getItem('preferFlat') === 'true');
  const [fontSize, setFontSize] = useState(1.1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [setlistEntries, setSetlistEntries] = useState(null);

  const setlistShareId = searchParams.get('setlist');
  const currentPos = parseInt(searchParams.get('pos') || '0', 10);
  const instrumentParam = searchParams.get('instrument');

  useEffect(() => {
    const findMatch = (tabList, query) => {
      if (!query) return 0;
      const exactMatch = tabList.findIndex((t) => {
        const inst = getInstrumentById(t.instrument);
        const label = t.suffix ? `${inst.name} - ${t.suffix}` : inst.name;
        return label.toLowerCase() === query.toLowerCase();
      });
      if (exactMatch >= 0) return exactMatch;
      const instrumentMatch = tabList.findIndex((t) => t.instrument === query);
      if (instrumentMatch >= 0) return instrumentMatch;
      return 0;
    };

    const fetchMelody = async () => {
      try {
        const data = await melodyService.getSharedMelody(shareId);
        setMelody(data);
        if (data.tabs && data.tabs.length > 0) {
          setTabs(data.tabs);
          setActiveTabIndex(findMatch(data.tabs, instrumentParam));
        } else {
          setTabs([{ id: 'fallback', instrument: 'piano', notation: data.notation, position: 0, suffix: null }]);
          setActiveTabIndex(0);
        }
        setTransposeSemitones(0);
      } catch (err) {
        setError(err.response?.status === 404
          ? 'This melody was not found or is no longer public.'
          : 'Failed to load melody.');
      } finally {
        setLoading(false);
      }
    };
    fetchMelody();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareId]);

  useEffect(() => {
    if (!setlistShareId) return;
    const fetchSetlist = async () => {
      try {
        const data = await setlistService.getSharedSetlist(setlistShareId);
        setSetlistEntries(data.entries || []);
      } catch (err) {}
    };
    fetchSetlist();
  }, [setlistShareId]);

  const getTabLabel = (tab) => {
    const instrument = getInstrumentById(tab.instrument);
    return tab.suffix ? `${instrument.name} - ${tab.suffix}` : instrument.name;
  };

  const handleTabSwitch = (index) => {
    setActiveTabIndex(index);
    const tab = tabs[index];
    const newParams = new URLSearchParams(searchParams);
    newParams.set('instrument', tab.instrument);
    setSearchParams(newParams, { replace: true });
  };

  const handleFlatToggle = (flat) => {
    setPreferFlat(flat);
    localStorage.setItem('preferFlat', flat ? 'true' : 'false');
  };

  const handleTranspose = (semitones) => {
    setTransposeSemitones((prev) => prev + semitones);
  };

  const navigateToEntry = (index) => {
    if (!setlistEntries || index < 0 || index >= setlistEntries.length) return;
    const entry = setlistEntries[index];
    const currentTab = tabs[activeTabIndex];
    const instrumentQuery = currentTab ? currentTab.instrument : '';
    navigate(`/shared/${entry.melody_share_id}?setlist=${setlistShareId}&pos=${index}&instrument=${instrumentQuery}`);
  };

  const activeTab = tabs[activeTabIndex];
  const rawNotation = activeTab
    ? (transposeSemitones !== 0 ? transposeNotes(activeTab.notation, transposeSemitones, !preferFlat) : activeTab.notation)
    : '';
  const displayNotation = preferFlat ? convertAccidentals(rawNotation, false) : rawNotation;

  if (loading) return <div className="page-loading">Loading shared melody...</div>;

  if (error) {
    return (
      <div className="shared-melody-page">
        <div className="error-state">
          <h2>Melody Not Found</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-melody-page">
      <div className="shared-melody-container">
        <h1>{melody.title}</h1>

        {tabs.length > 1 && (
          <div className="shared-tabs-bar" style={{ display: 'flex', gap: '4px', marginBottom: '12px', overflowX: 'auto' }}>
            {tabs.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => handleTabSwitch(i)}
                style={{
                  padding: '6px 12px',
                  border: `2px solid ${i === activeTabIndex ? '#1976d2' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  background: i === activeTabIndex ? '#e3f2fd' : '#f5f5f5',
                  color: i === activeTabIndex ? '#1976d2' : '#555',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {getTabLabel(tab)}
              </button>
            ))}
          </div>
        )}

        <div style={{ fontSize: `${fontSize}rem`, fontWeight: 600, whiteSpace: 'pre-wrap', marginBottom: '12px' }}>
          {classifyLines(displayNotation).map((line, i, arr) => (
            <span key={i}>
              <span style={{ color: line.type === 'notes' ? '#2e7d32' : line.type === 'lyrics' ? '#e65100' : '#333' }}>
                {line.text}
              </span>
              {i < arr.length - 1 ? '\n' : ''}
            </span>
          ))}
        </div>

        {melody.author && (
          <p className="melody-author">by {melody.author.username}</p>
        )}

        {setlistEntries && (
          <div style={{ marginBottom: '16px' }}>
            <select
              value={currentPos}
              onChange={(e) => navigateToEntry(parseInt(e.target.value, 10))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '0.95rem', marginBottom: '8px' }}
            >
              {setlistEntries.map((entry, i) => (
                <option key={entry.id} value={i}>
                  {i + 1}. {entry.melody_title}
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '8px' }}>
              {currentPos > 0 ? (
                <button
                  onClick={() => navigateToEntry(currentPos - 1)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #1976d2', background: '#e3f2fd', color: '#1976d2', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  ← {setlistEntries[currentPos - 1]?.melody_title?.slice(0, 25)}{setlistEntries[currentPos - 1]?.melody_title?.length > 25 ? '...' : ''}
                </button>
              ) : (
                <div style={{ flex: 1 }} />
              )}
              {setlistEntries && currentPos < setlistEntries.length - 1 ? (
                <button
                  onClick={() => navigateToEntry(currentPos + 1)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #1976d2', background: '#e3f2fd', color: '#1976d2', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {setlistEntries[currentPos + 1]?.melody_title?.slice(0, 25)}{setlistEntries[currentPos + 1]?.melody_title?.length > 25 ? '...' : ''} →
                </button>
              ) : (
                <div style={{ flex: 1 }} />
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div className="transpose-controls" style={{ marginBottom: 0 }}>
            <div className="transpose-group">
              <button className="transpose-btn minus" onClick={() => handleTranspose(-1)} disabled={!displayNotation} aria-label="Down half step">-</button>
              <span className="transpose-label">half</span>
              <button className="transpose-btn plus" onClick={() => handleTranspose(1)} disabled={!displayNotation} aria-label="Up half step">+</button>
            </div>
            <div className="transpose-group">
              <button className="transpose-btn minus" onClick={() => handleTranspose(-2)} disabled={!displayNotation} aria-label="Down whole step">-</button>
              <span className="transpose-label">whole</span>
              <button className="transpose-btn plus" onClick={() => handleTranspose(2)} disabled={!displayNotation} aria-label="Up whole step">+</button>
            </div>
            <div className="transpose-group">
              <button className="transpose-btn minus" onClick={() => handleTranspose(-12)} disabled={!displayNotation} aria-label="Down octave">-</button>
              <span className="transpose-label">octave</span>
              <button className="transpose-btn plus" onClick={() => handleTranspose(12)} disabled={!displayNotation} aria-label="Up octave">+</button>
            </div>
            <div className="transpose-group">
              <button className="transpose-btn minus" onClick={() => setFontSize((s) => Math.max(0.7, +(s - 0.2).toFixed(1)))} aria-label="Decrease font size">A-</button>
              <span className="transpose-label">font</span>
              <button className="transpose-btn plus" onClick={() => setFontSize((s) => Math.min(3, +(s + 0.2).toFixed(1)))} aria-label="Increase font size">A+</button>
            </div>
          </div>
          <FlatToggle preferFlat={preferFlat} onToggle={handleFlatToggle} />
        </div>

        {/* <MelodyPlayer notation={displayNotation} /> */}

        {user && melody.author && user.username === melody.author.username && (
          <button
            className="btn-edit"
            onClick={() => navigate(`/compose?edit=${melody.id}`)}
            style={{ marginTop: '16px' }}
          >
            Edit Melody
          </button>
        )}
      </div>
    </div>
  );
}

export default SharedMelodyPage;
