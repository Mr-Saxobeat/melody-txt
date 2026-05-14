import React from 'react';
import { INSTRUMENTS } from '../utils/instruments';
import useTranslation from '../i18n/useTranslation';
import './InstrumentSelectModal.css';

function InstrumentSelectModal({ onSelect, onDismiss }) {
  const { t } = useTranslation();

  return (
    <div className="source-modal-overlay" onClick={onDismiss}>
      <div className="source-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{t('instrument.selectTitle')}</h3>
        <p className="source-modal-hint">{t('instrument.selectHint')}</p>
        <div className="source-instrument-list">
          {INSTRUMENTS.map((inst) => (
            <button
              key={inst.id}
              className="source-instrument-option"
              onClick={() => onSelect(inst.id)}
            >
              {t(`instrument.${inst.id}`)} in {inst.key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InstrumentSelectModal;
