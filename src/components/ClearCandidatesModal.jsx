import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert } from 'lucide-react';

export default function ClearCandidatesModal({ isOpen, candidateCount, onClose, onConfirmClear }) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE';

  const handleConfirm = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    try {
      await onConfirmClear();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header" style={{ backgroundColor: '#fff1f2', borderBottomColor: '#fecdd3' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9f1239' }}>
            <ShieldAlert size={18} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Admin: Remove All Candidates</h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.875rem', color: 'var(--c-primary)', marginBottom: '0.75rem', fontWeight: 600 }}>
            Warning: This action will permanently remove all {candidateCount} candidate records, ongoing interview sessions, and evaluation scorecards.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--c-muted)', marginBottom: '1.25rem' }}>
            To confirm this destructive admin operation, please type <strong style={{ color: '#9f1239', fontFamily: 'var(--font-mono)' }}>DELETE</strong> below:
          </p>

          <input
            type="text"
            placeholder="Type DELETE to confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              fontSize: '0.9rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              marginBottom: '0.5rem'
            }}
          />
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            disabled={!isConfirmed || isDeleting}
            onClick={handleConfirm}
            style={{
              backgroundColor: isConfirmed ? '#991b1b' : 'transparent',
              color: isConfirmed ? '#ffffff' : '#991b1b',
              cursor: isConfirmed ? 'pointer' : 'not-allowed',
              opacity: isConfirmed ? 1 : 0.5
            }}
          >
            <Trash2 size={14} />
            <span>{isDeleting ? 'Clearing...' : 'Permanently Delete All'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
