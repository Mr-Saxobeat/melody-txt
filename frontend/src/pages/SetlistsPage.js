import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import setlistService from '../services/setlistService';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

function SetlistsPage({ mode = 'mine' }) {
  const [setlists, setSetlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchSetlists = useCallback(async () => {
    try {
      let data;
      if (mode === 'mine') {
        data = await setlistService.getSetlists();
        setSetlists(data.results || data);
      } else {
        const response = await api.get('/setlists/recent/');
        setSetlists(response.data.results || response.data);
      }
    } catch (err) {}
    finally { setLoading(false); }
  }, [mode]);

  useEffect(() => { fetchSetlists(); }, [fetchSetlists]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const setlist = await setlistService.createSetlist(newTitle.trim());
      setNewTitle('');
      navigate(`/setlists/${setlist.id}`);
    } catch (err) {}
    finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    await setlistService.deleteSetlist(id);
    setSetlists(setlists.filter((s) => s.id !== id));
  };

  const isOwner = (setlist) => user && setlist.author && setlist.author.username === user.username;

  if (loading) return <div className="page-loading">Loading setlists...</div>;

  return (
    <div className="my-melodies-page">
      <div className="page-header">
        <h1>{mode === 'mine' ? 'My Setlists' : 'Setlists'}</h1>
      </div>

      {mode === 'mine' && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New setlist title..."
            style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '1rem' }}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button className="btn-primary" onClick={handleCreate} disabled={creating || !newTitle.trim()}>
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      )}

      {setlists.length === 0 ? (
        <div className="empty-state">
          <p>{mode === 'mine' ? "You haven't created any setlists yet." : 'No public setlists yet.'}</p>
        </div>
      ) : (
        <div className="melody-grid">
          {setlists.map((setlist) => (
            <div
              key={setlist.id}
              className="melody-card"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (isOwner(setlist)) {
                  navigate(`/setlists/${setlist.id}`);
                } else {
                  navigate(`/shared-setlist/${setlist.share_id}`);
                }
              }}
            >
              <div className="melody-card-header">
                <h3>{setlist.title}</h3>
              </div>
              <div className="melody-meta">
                {setlist.author && <span>by {setlist.author.username}</span>}
                <span>{setlist.entry_count} melodies</span>
                <span>{new Date(setlist.created_at).toLocaleDateString()}</span>
              </div>
              {isOwner(setlist) && (
                <div className="melody-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="btn-edit" onClick={() => navigate(`/setlists/${setlist.id}`)}>
                    Edit
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(setlist.id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SetlistsPage;
