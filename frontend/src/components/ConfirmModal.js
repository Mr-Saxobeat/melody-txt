import React from 'react';
import './ConfirmModal.css';

function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel, cancelLabel }) {
  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-modal-actions">
          <button className="btn-confirm-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button className="btn-confirm-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
