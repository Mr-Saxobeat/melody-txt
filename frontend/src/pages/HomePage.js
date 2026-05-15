import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import melodyService from '../services/melodyService';
import { useAuth } from '../hooks/useAuth';
import useDebounce from '../hooks/useDebounce';
import useTranslation from '../i18n/useTranslation';

function HomePage() {
  const [melodies, setMelodies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [nextCursor, setNextCursor] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const debouncedSearch = useDebounce(searchTerm, 300);
  const sentinelRef = useRef(null);
  const nextCursorRef = useRef(null);
  const loadingMoreRef = useRef(false);

  nextCursorRef.current = nextCursor;
  loadingMoreRef.current = loadingMore;

  const fetchMelodies = useCallback(async (cursor, search) => {
    try {
      const data = await melodyService.getRecentMelodiesPaginated(cursor, search);
      if (cursor) {
        setMelodies((prev) => [...prev, ...data.results]);
      } else {
        setMelodies(data.results);
      }
      setNextCursor(extractCursor(data.next));
    } catch (err) {
      // silently handle
    }
  }, []);

  const isInitialLoad = useRef(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (isInitialLoad.current) {
        setLoading(true);
      } else {
        setSearching(true);
      }
      await fetchMelodies(null, debouncedSearch);
      if (!cancelled) {
        setLoading(false);
        setSearching(false);
        isInitialLoad.current = false;
      }
    };
    load();
    return () => { cancelled = true; };
  }, [debouncedSearch, fetchMelodies]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && nextCursorRef.current && !loadingMoreRef.current) {
        setLoadingMore(true);
        fetchMelodies(nextCursorRef.current, debouncedSearch).finally(() => {
          setLoadingMore(false);
        });
      }
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [debouncedSearch, fetchMelodies]);

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

      <input
        type="text"
        className="search-input"
        placeholder={t('search.placeholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 16px',
          fontSize: '1rem',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          marginBottom: '16px',
          boxSizing: 'border-box',
        }}
      />

      {loading ? (
        <div className="page-loading">{t('home.loading')}</div>
      ) : searching ? (
        <div style={{ textAlign: 'center', padding: '12px', color: '#666' }}>
          {t('search.loading')}
        </div>
      ) : melodies.length === 0 ? (
        <div className="empty-state">
          <p>
            {searchTerm.trim()
              ? t('search.noResults', { term: searchTerm })
              : t('home.empty')}
          </p>
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

      <div ref={sentinelRef} style={{ height: '1px' }} />

      {loadingMore && (
        <div style={{ textAlign: 'center', padding: '12px', color: '#666' }}>
          {t('home.loading')}
        </div>
      )}
    </div>
  );
}

function extractCursor(nextUrl) {
  if (!nextUrl) return null;
  try {
    const url = new URL(nextUrl);
    return url.searchParams.get('cursor');
  } catch {
    return null;
  }
}

export default HomePage;
