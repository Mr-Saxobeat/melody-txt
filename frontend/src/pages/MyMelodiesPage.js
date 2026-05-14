import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import melodyService from '../services/melodyService';
import { copyToClipboard } from '../utils/clipboard';
import useTranslation from '../i18n/useTranslation';

function MyMelodiesPage() {
  const [melodies, setMelodies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [copySuccess, setCopySuccess] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchMelodies = useCallback(async () => {
    try {
      setLoading(true);
      const data = await melodyService.getUserMelodies();
      setMelodies(data.results);
      setError(null);
    } catch (err) {
      setError(t('melodies.loadFailed'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setError(t('melodies.deleteFailed'));
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
    return <div className="page-loading">{t('melodies.loading')}</div>;
  }

  return (
    <div className="my-melodies-page">
      <div className="page-header">
        <h1>{t('melodies.title')}</h1>
        <button className="btn-primary" onClick={() => navigate('/compose')}>
          {t('melodies.composeNew')}
        </button>
      </div>

      {error && <p className="page-error">{error}</p>}

      {melodies.length === 0 ? (
        <div className="empty-state">
          <p>{t('melodies.empty')}</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            {t('melodies.createFirst')}
          </button>
        </div>
      ) : (
        <div className="melody-grid">
          {melodies.map((melody) => (
            <div key={melody.id} className="melody-card" onClick={() => navigate(`/shared/${melody.share_id}`)} style={{ cursor: 'pointer' }}>
              <div className="melody-card-header">
                <h3>{melody.title}</h3>
              </div>
              <div className="melody-meta">
                <span>{melody.note_count} {t('melodies.notes', { count: melody.note_count }).replace(`${melody.note_count} `, '')}</span>
                <span>{melody.duration_seconds}s</span>
                <span>{new Date(melody.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="melody-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn-share"
                  onClick={() => handleShare(melody)}
                >
                  {copySuccess === melody.id ? t('melodies.linkCopied') : t('melodies.share')}
                </button>
                <button
                  className="btn-edit"
                  onClick={() => navigate(`/shared/${melody.share_id}`)}
                >
                  {t('melodies.edit')}
                </button>
                {deleteConfirm === melody.id ? (
                  <div className="delete-confirm">
                    <span>{t('melodies.deleteConfirm')}</span>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(melody.id)}
                    >
                      {t('melodies.yes')}
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      {t('melodies.no')}
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn-danger"
                    onClick={() => setDeleteConfirm(melody.id)}
                  >
                    {t('melodies.delete')}
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
