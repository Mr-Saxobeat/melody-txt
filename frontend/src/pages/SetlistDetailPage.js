import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import setlistService from '../services/setlistService';
import melodyService from '../services/melodyService';
import api from '../services/api';
import { copyToClipboard } from '../utils/clipboard';
import useTranslation from '../i18n/useTranslation';

function SetlistDetailPage({ readOnly = false }) {
  const { id, shareId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [setlist, setSetlist] = useState(null);
  const [melodies, setMelodies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const canDrag = useRef(false);
  const touchDragging = useRef(false);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const fetchSetlist = useCallback(async () => {
    try {
      const data = readOnly
        ? await setlistService.getSharedSetlist(shareId)
        : await setlistService.getSetlist(id);
      setSetlist(data);
      setTitleValue(data.title);
    } catch (err) {
      navigate(readOnly ? '/' : '/setlists');
    } finally {
      setLoading(false);
    }
  }, [id, shareId, readOnly, navigate]);

  useEffect(() => { fetchSetlist(); }, [fetchSetlist]);

  const loadMelodies = async () => {
    try {
      const [own, recent] = await Promise.all([
        melodyService.getUserMelodies(),
        api.get('/melodies/recent/'),
      ]);
      const ownList = own.results || [];
      const recentList = (recent.data.results || recent.data).filter(
        (m) => !ownList.some((o) => o.id === m.id)
      );
      setMelodies([...ownList, ...recentList]);
      setShowAddPicker(true);
    } catch (err) {}
  };

  const handleAddMelody = async (melodyId) => {
    const position = setlist.entries ? setlist.entries.length : 0;
    await setlistService.addEntry(id, melodyId, position);
    fetchSetlist();
  };

  const handleRemoveEntry = async (entryId) => {
    await setlistService.removeEntry(id, entryId);
    fetchSetlist();
  };

  const handleTitleSave = async () => {
    if (titleValue.trim() && titleValue !== setlist.title) {
      await setlistService.updateSetlist(id, { title: titleValue.trim() });
      fetchSetlist();
    }
    setEditingTitle(false);
  };

  const handleDragStart = (e, index) => {
    if (!canDrag.current) {
      e.preventDefault();
      return;
    }
    dragItem.current = index;
    setDraggingIndex(index);
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
    setOverIndex(index);
  };

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const entries = [...setlist.entries];
    const draggedEntry = entries[dragItem.current];
    entries.splice(dragItem.current, 1);
    entries.splice(dragOverItem.current, 0, draggedEntry);

    const reordered = entries.map((entry, i) => ({ ...entry, position: i }));
    setSetlist({ ...setlist, entries: reordered });

    for (const entry of reordered) {
      await setlistService.updateEntry(id, entry.id, entry.position);
    }

    dragItem.current = null;
    dragOverItem.current = null;
    canDrag.current = false;
    setDraggingIndex(null);
    setOverIndex(null);
  };

  const handleTouchStart = (index) => {
    touchDragging.current = true;
    dragItem.current = index;
    setDraggingIndex(index);
  };

  const handleTouchMove = (e) => {
    if (!touchDragging.current) return;
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element) {
      const row = element.closest('[data-index]');
      if (row) {
        const idx = parseInt(row.dataset.index, 10);
        dragOverItem.current = idx;
        setOverIndex(idx);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!touchDragging.current) return;
    touchDragging.current = false;
    setDraggingIndex(null);
    setOverIndex(null);

    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const entries = [...setlist.entries];
    const draggedEntry = entries[dragItem.current];
    entries.splice(dragItem.current, 1);
    entries.splice(dragOverItem.current, 0, draggedEntry);

    const reordered = entries.map((entry, i) => ({ ...entry, position: i }));
    setSetlist({ ...setlist, entries: reordered });

    for (const entry of reordered) {
      await setlistService.updateEntry(id, entry.id, entry.position);
    }

    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleShare = () => {
    const url = `${window.location.origin}/shared-setlist/${setlist.share_id}`;
    copyToClipboard(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleTogglePublic = async () => {
    await setlistService.updateSetlist(id, { title: setlist.title, is_public: !setlist.is_public });
    fetchSetlist();
  };

  if (loading) return <div className="page-loading">{t('setlistDetail.loading')}</div>;
  if (!setlist) return null;

  return (
    <div className="my-melodies-page">
      <div className="page-header">
        {!readOnly && editingTitle ? (
          <input
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
            autoFocus
            style={{ fontSize: '2rem', fontWeight: 'bold', border: 'none', borderBottom: '2px solid var(--primary-color, #1976d2)', outline: 'none', background: 'transparent' }}
          />
        ) : (
          <h1 onClick={!readOnly ? () => setEditingTitle(true) : undefined} style={!readOnly ? { cursor: 'pointer' } : {}} title={!readOnly ? t('setlistDetail.clickToEditTitle') : ''}>
            {setlist.title}
          </h1>
        )}
        {!readOnly && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="btn-secondary" onClick={handleTogglePublic} style={{ fontSize: '0.85rem' }}>
              {setlist.is_public ? `🔓 ${t('setlistDetail.public')}` : `🔒 ${t('setlistDetail.private')}`}
            </button>
            <button className="btn-share" onClick={handleShare}>
              {copySuccess ? t('setlistDetail.linkCopied') : t('setlistDetail.share')}
            </button>
            <button className="btn-primary" onClick={loadMelodies}>
              {t('setlistDetail.addMelody')}
            </button>
          </div>
        )}
        {readOnly && setlist.author && (
          <p style={{ color: '#666', margin: 0 }}>{t('setlistDetail.by', { name: setlist.author.username })}</p>
        )}
      </div>

      {showAddPicker && (
        <div className="save-dialog-overlay">
          <div className="save-dialog">
            <h3>{t('setlistDetail.addMelodyDialog')}</h3>
            {melodies.length === 0 ? (
              <p>{t('setlistDetail.noMelodiesInLibrary')}</p>
            ) : (
              <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                {melodies.map((m) => (
                  <div key={m.id} style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }} onClick={() => handleAddMelody(m.id)}>
                    {m.title}
                  </div>
                ))}
              </div>
            )}
            <button className="btn-secondary" onClick={() => setShowAddPicker(false)} style={{ marginTop: '12px' }}>
              {t('setlistDetail.cancel')}
            </button>
          </div>
        </div>
      )}

      {(!setlist.entries || setlist.entries.length === 0) ? (
        <div className="empty-state">
          <p>{t('setlistDetail.empty')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {setlist.entries.map((entry, index) => (
            <div
              key={entry.id}
              data-index={index}
              draggable={!readOnly}
              onDragStart={!readOnly ? (e) => handleDragStart(e, index) : undefined}
              onDragEnter={!readOnly ? () => handleDragEnter(index) : undefined}
              onDragEnd={!readOnly ? handleDragEnd : undefined}
              onDragOver={!readOnly ? (e) => e.preventDefault() : undefined}
              onTouchMove={!readOnly ? handleTouchMove : undefined}
              onTouchEnd={!readOnly ? handleTouchEnd : undefined}
              onClick={() => navigate(`/shared/${entry.melody_share_id}?setlist=${readOnly ? shareId : setlist.share_id}&pos=${index}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                background: draggingIndex === index ? '#e3f2fd' : 'white',
                borderRadius: '8px',
                border: overIndex === index && draggingIndex !== null && draggingIndex !== index ? '2px solid var(--primary-color, #1976d2)' : '1px solid #e0e0e0',
                gap: '12px',
                cursor: 'pointer',
                opacity: draggingIndex === index ? 0.6 : 1,
                transition: 'border 0.15s, opacity 0.15s, background 0.15s',
              }}
            >
              {!readOnly && (
                <span
                  onMouseDown={(e) => { e.stopPropagation(); canDrag.current = true; }}
                  onMouseUp={() => { canDrag.current = false; }}
                  onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(index); }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ cursor: 'grab', fontSize: '1.2rem', color: '#999', userSelect: 'none', touchAction: 'none' }}
                  title={t('setlistDetail.dragToReorder')}
                >
                  &#x2630;
                </span>
              )}
              <span style={{ color: '#999', fontWeight: '600', minWidth: '24px' }}>{index + 1}.</span>
              <span style={{ flex: 1, fontWeight: '500' }}>
                {entry.melody_title}
              </span>
              {!readOnly && (
                <button
                  className="btn-danger"
                  onClick={(e) => { e.stopPropagation(); handleRemoveEntry(entry.id); }}
                  style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                >
                  {t('setlistDetail.remove')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SetlistDetailPage;
