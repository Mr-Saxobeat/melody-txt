import React from 'react';
import useTranslation from '../i18n/useTranslation';

function FlatToggle({ preferFlat, onToggle }) {
  const { t } = useTranslation();

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#555', cursor: 'pointer', userSelect: 'none' }}>
      <input
        type="checkbox"
        checked={preferFlat}
        onChange={(e) => onToggle(e.target.checked)}
        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
      />
      {t('flat.label')}
    </label>
  );
}

export default FlatToggle;
