import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import setlistService from '../services/setlistService';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import useTranslation from '../i18n/useTranslation';

function SetlistsPage({ mode = 'mine' }) {
  const [setlists, setSetlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

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

  if (loading) return <div className="page-loading">{t('setlists.loading')}</div>;

  return (
    <div className="my-melodies-page">
      <div className="page-header">
        <h1>{mode === 'mine' ? t('setlists.myTitle') : t('setlists.title')}</h1>
      </div>

      {mode === 'mine' && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={t('setlists.newPlaceholder')}
            style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '1rem' }}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button className="btn-primary" onClick={handleCreate} disabled={creating || !newTitle.trim()}>
            {creating ? t('setlists.creating') : t('setlists.create')}
          </button>
        </div>
      )}

      {setlists.length === 0 ? (
        <div className="empty-state">
          <p>{mode === 'mine' ? t('setlists.emptyMine') : t('setlists.emptyPublic')}</p>
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
                {setlist.author && <span>{t('setlists.by', { name: setlist.author.username })}</span>}
                <span>{t('setlists.melodyCount', { count: setlist.entry_count })}</span>
                <span>{new Date(setlist.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              {isOwner(setlist) && (
                <div className="melody-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="btn-edit" onClick={() => navigate(`/setlists/${setlist.id}`)}>
                    {t('setlists.edit')}
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(setlist.id)}>
                    {t('setlists.delete')}
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
