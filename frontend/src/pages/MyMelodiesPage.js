import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import melodyService from '../services/melodyService';
import MelodyPlayer from '../components/MelodyPlayer';
import { copyToClipboard } from '../utils/clipboard';

function MyMelodiesPage() {
  const [melodies, setMelodies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [copySuccess, setCopySuccess] = useState(null);
  const navigate = useNavigate();

  const fetchMelodies = useCallback(async () => {
    try {
      setLoading(true);
      const data = await melodyService.getUserMelodies();
      setMelodies(data.results);
      setError(null);
    } catch (err) {
      setError('Failed to load melodies.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMelodies();
  }, [fetchMelodies]);

  const handleDelete = async (id) => {
    try {
      await melodyService.deleteMelody(id);
      setMelodies(melodies.filter((m) => m.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete melody.');
    }
  };

  const handleShare = (melody) => {
    const shareUrl = `${window.location.origin}/shared/${melody.share_id}`;
    copyToClipboard(shareUrl).then(() => {
      setCopySuccess(melody.id);
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };

  if (loading) {
    return <div className="page-loading">Loading your melodies...</div>;
  }

  return (
    <div className="my-melodies-page">
      <div className="page-header">
        <h1>My Melodies</h1>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Compose New
        </button>
      </div>

      {error && <p className="page-error">{error}</p>}

      {melodies.length === 0 ? (
        <div className="empty-state">
          <p>You haven't saved any melodies yet.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Create your first melody
          </button>
        </div>
      ) : (
        <div className="melody-grid">
          {melodies.map((melody) => (
            <div key={melody.id} className="melody-card">
              <div className="melody-card-header">
                <h3>{melody.title}</h3>
              </div>
              <div className="melody-meta">
                <span>{melody.note_count} notes</span>
                <span>{melody.duration_seconds}s</span>
                <span>{new Date(melody.created_at).toLocaleDateString()}</span>
              </div>
              <MelodyPlayer notation={melody.notation} />
              <div className="melody-actions">
                <button
                  className="btn-share"
                  onClick={() => handleShare(melody)}
                >
                  {copySuccess === melody.id ? 'Link copied!' : 'Share'}
                </button>
                <button
                  className="btn-edit"
                  onClick={() => navigate(`/shared/${melody.share_id}`)}
                >
                  Edit
                </button>
                {deleteConfirm === melody.id ? (
                  <div className="delete-confirm">
                    <span>Delete?</span>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(melody.id)}
                    >
                      Yes
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn-danger"
                    onClick={() => setDeleteConfirm(melody.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyMelodiesPage;
