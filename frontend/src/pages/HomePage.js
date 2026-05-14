import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import useTranslation from '../i18n/useTranslation';

function HomePage() {
  const [melodies, setMelodies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await api.get('/melodies/recent/');
        setMelodies(response.data.results || response.data);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  if (loading) return <div className="page-loading">{t('home.loading')}</div>;

  return (
    <div className="my-melodies-page">
      <div className="page-header">
        <h1>{t('home.title')}</h1>
        {isAuthenticated && (
          <button className="btn-primary" onClick={() => navigate('/compose')}>
            {t('home.composeNew')}
          </button>
        )}
      </div>

      {melodies.length === 0 ? (
        <div className="empty-state">
          <p>{t('home.empty')}</p>
        </div>
      ) : (
        <div className="melody-grid">
          {melodies.map((melody) => (
            <div
              key={melody.id}
              className="melody-card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/shared/${melody.share_id}`)}
            >
              <div className="melody-card-header">
                <h3>{melody.title}</h3>
              </div>
              <div className="melody-meta">
                <span>{t('home.by', { name: melody.author?.username || 'anonymous' })}</span>
                <span>{new Date(melody.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
