import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MelodyComposer from '../components/MelodyComposer';
import MelodyPlayer from '../components/MelodyPlayer';
import TransposeControls from '../components/TransposeControls';
import { useAuth } from '../hooks/useAuth';
import melodyService from '../services/melodyService';
import { transposeNotes } from '../utils/transposer';
import './ComposerPage.css';

function ComposerPage() {
  const [notation, setNotation] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && isAuthenticated) {
      melodyService.getMelody(editId).then((melody) => {
        setNotation(melody.notation);
        setTitle(melody.title);
        setEditingId(melody.id);
      }).catch(() => {});
    }
  }, [searchParams, isAuthenticated]);

  const handleNotationChange = (newNotation) => {
    setNotation(newNotation);
    setSaveSuccess(false);
  };

  const handleValidationChange = (valid) => {
    setIsValid(valid);
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
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

    try {
      if (editingId) {
        await melodyService.updateMelody(editingId, {
          title: title.trim(),
          notation,
          is_public: true,
        });
      } else {
        await melodyService.createMelody(title.trim(), notation);
      }
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
            </ul>
          </div>
        </header>

        <div className="composer-section">
          <label className="composer-label">Enter your melody (notes and lyrics):</label>
          <MelodyPlayer notation={notation} disabled={!isValid || !notation} />
          <TransposeControls
            onTranspose={(semitones) => setNotation(transposeNotes(notation, semitones))}
            disabled={!notation}
          />
          <MelodyComposer
            notation={notation}
            onChange={handleNotationChange}
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
