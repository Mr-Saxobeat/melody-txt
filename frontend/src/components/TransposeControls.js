import React from 'react';
import useTranslation from '../i18n/useTranslation';
import './TransposeControls.css';

function TransposeControls({ onTranspose, disabled }) {
  const { t } = useTranslation();

  return (
    <div className="transpose-controls">
      <div className="transpose-group">
        <button
          className="transpose-btn minus"
          onClick={() => onTranspose(-1)}
          disabled={disabled}
          aria-label="Down half step"
        >
          -
        </button>
        <span className="transpose-label">{t('transpose.halfStep')}</span>
        <button
          className="transpose-btn plus"
          onClick={() => onTranspose(1)}
          disabled={disabled}
          aria-label="Up half step"
        >
          +
        </button>
      </div>
      <div className="transpose-group">
        <button
          className="transpose-btn minus"
          onClick={() => onTranspose(-2)}
          disabled={disabled}
          aria-label="Down whole step"
        >
          -
        </button>
        <span className="transpose-label">{t('transpose.wholeStep')}</span>
        <button
          className="transpose-btn plus"
          onClick={() => onTranspose(2)}
          disabled={disabled}
          aria-label="Up whole step"
        >
          +
        </button>
      </div>
      <div className="transpose-group">
        <button
          className="transpose-btn minus"
          onClick={() => onTranspose(-12)}
          disabled={disabled}
          aria-label="Down octave"
        >
          -
        </button>
        <span className="transpose-label">{t('transpose.octave')}</span>
        <button
          className="transpose-btn plus"
          onClick={() => onTranspose(12)}
          disabled={disabled}
          aria-label="Up octave"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default TransposeControls;
