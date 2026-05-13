import React from 'react';
import { INSTRUMENTS } from '../utils/instruments';
import './InstrumentSelectModal.css';

function InstrumentSelectModal({ onSelect, onDismiss }) {
  return (
    <div className="source-modal-overlay" onClick={onDismiss}>
      <div className="source-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Select Your Instrument</h3>
        <p className="source-modal-hint">Choose the instrument you'll compose in</p>
        <div className="source-instrument-list">
          {INSTRUMENTS.map((inst) => (
            <button
              key={inst.id}
              className="source-instrument-option"
              onClick={() => onSelect(inst.id)}
            >
              {inst.name} in {inst.key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InstrumentSelectModal;
