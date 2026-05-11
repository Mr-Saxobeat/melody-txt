import React from 'react';

function FlatToggle({ preferFlat, onToggle }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#555', cursor: 'pointer', userSelect: 'none' }}>
      <input
        type="checkbox"
        checked={preferFlat}
        onChange={(e) => onToggle(e.target.checked)}
        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
      />
      View flat notes (b)
    </label>
  );
}

export default FlatToggle;
