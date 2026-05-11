import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import melodyService from '../services/melodyService';
import setlistService from '../services/setlistService';
// import MelodyPlayer from '../components/MelodyPlayer';
import { transposeNotes } from '../utils/transposer';
import { classifyLines } from '../utils/validation';
import '../components/TransposeControls.css';
import { useAuth } from '../hooks/useAuth';

function SharedMelodyPage() {
  const { shareId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [melody, setMelody] = useState(null);
  const [notation, setNotation] = useState('');
  const [fontSize, setFontSize] = useState(1.1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [setlistEntries, setSetlistEntries] = useState(null);

  const setlistShareId = searchParams.get('setlist');
  const currentPos = parseInt(searchParams.get('pos') || '0', 10);

  useEffect(() => {
    const fetchMelody = async () => {
      try {
        const data = await melodyService.getSharedMelody(shareId);
        setMelody(data);
        setNotation(data.notation);
      } catch (err) {
        setError(err.response?.status === 404
          ? 'This melody was not found or is no longer public.'
          : 'Failed to load melody.');
      } finally {
        setLoading(false);
      }
    };
    fetchMelody();
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

  const navigateToEntry = (index) => {
    if (!setlistEntries || index < 0 || index >= setlistEntries.length) return;
    const entry = setlistEntries[index];
    navigate(`/shared/${entry.melody_share_id}?setlist=${setlistShareId}&pos=${index}`);
  };

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
        {melody.author && (
          <p className="melody-author">by {melody.author.username}</p>
        )}

        <div style={{ fontSize: `${fontSize}rem`, fontWeight: 600, whiteSpace: 'pre-wrap', marginBottom: '12px' }}>
          {classifyLines(notation).map((line, i, arr) => (
            <span key={i}>
              <span style={{ color: line.type === 'notes' ? '#2e7d32' : line.type === 'lyrics' ? '#e65100' : '#333' }}>
                {line.text}
              </span>
              {i < arr.length - 1 ? '\n' : ''}
            </span>
          ))}
        </div>

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

        <div className="transpose-controls" style={{ marginBottom: '12px' }}>
          <div className="transpose-group">
            <button className="transpose-btn minus" onClick={() => setNotation(transposeNotes(notation, -1))} disabled={!notation} aria-label="Down half step">-</button>
            <span className="transpose-label">half</span>
            <button className="transpose-btn plus" onClick={() => setNotation(transposeNotes(notation, 1))} disabled={!notation} aria-label="Up half step">+</button>
          </div>
          <div className="transpose-group">
            <button className="transpose-btn minus" onClick={() => setNotation(transposeNotes(notation, -2))} disabled={!notation} aria-label="Down whole step">-</button>
            <span className="transpose-label">whole</span>
            <button className="transpose-btn plus" onClick={() => setNotation(transposeNotes(notation, 2))} disabled={!notation} aria-label="Up whole step">+</button>
          </div>
          <div className="transpose-group">
            <button className="transpose-btn minus" onClick={() => setNotation(transposeNotes(notation, -12))} disabled={!notation} aria-label="Down octave">-</button>
            <span className="transpose-label">octave</span>
            <button className="transpose-btn plus" onClick={() => setNotation(transposeNotes(notation, 12))} disabled={!notation} aria-label="Up octave">+</button>
          </div>
          <div className="transpose-group">
            <button className="transpose-btn minus" onClick={() => setFontSize((s) => Math.max(0.7, +(s - 0.2).toFixed(1)))} aria-label="Decrease font size">A-</button>
            <span className="transpose-label">font</span>
            <button className="transpose-btn plus" onClick={() => setFontSize((s) => Math.min(3, +(s + 0.2).toFixed(1)))} aria-label="Increase font size">A+</button>
          </div>
        </div>

        {/* <MelodyPlayer notation={notation} /> */}
        
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
