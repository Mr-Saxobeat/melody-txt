import React from 'react';
import { getLoadedInstruments } from '../utils/instruments';
import useTranslation from '../i18n/useTranslation';
import './InstrumentSelectModal.css';

function InstrumentSelectModal({ onSelect, onDismiss }) {
  const { t } = useTranslation();
  const instruments = getLoadedInstruments();

  return (
    <div className="source-modal-overlay" onClick={onDismiss}>
      <div className="source-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{t('instrument.selectTitle')}</h3>
        <p className="source-modal-hint">{t('instrument.selectHint')}</p>
        <div className="source-instrument-list">
          {instruments.map((inst) => (
            <button
              key={inst.id}
              className="source-instrument-option"
              onClick={() => onSelect(inst.id)}
            >
              {inst.name} in {inst.pitch}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InstrumentSelectModal;
