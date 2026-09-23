import React, { useState } from 'react';
import { Scissors, AlertTriangle, X } from 'lucide-react';

const CUT_REASONS = [
  'Candidate withdrew / Declined role',
  'Severe technical / Connectivity disruption',
  'Candidate unavailable / Unreachable',
  'Academic backlog / Eligibility mismatch',
  'Interviewer decision (Immediate cutoff)',
  'Other operational contingency'
];

export default function CutInterviewModal({ isOpen, onClose, onConfirmCut }) {
  const [selectedReason, setSelectedReason] = useState(CUT_REASONS[0]);
  const [additionalDetails, setAdditionalDetails] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const fullReason = additionalDetails.trim() 
      ? `${selectedReason}: ${additionalDetails.trim()}`
      : selectedReason;
    onConfirmCut(fullReason);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header" style={{ borderBottomColor: '#fecdd3', backgroundColor: '#fff1f2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9f1239' }}>
            <Scissors size={18} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Cut / Terminate Interview Early</h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.85rem', color: 'var(--c-muted)', marginBottom: '1rem' }}>
            Cutting an interview ends the session immediately and releases the candidate lock. Please select a standardized reason for the evaluation records:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {CUT_REASONS.map(reason => (
              <label 
                key={reason}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.6rem', 
                  padding: '0.5rem 0.75rem', 
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: selectedReason === reason ? 'var(--c-accent-subtle)' : 'var(--bg-surface)',
                  borderColor: selectedReason === reason ? 'var(--c-accent)' : 'var(--border-color)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: selectedReason === reason ? 600 : 400
                }}
              >
                <input
                  type="radio"
                  name="cut_reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Optional Context / Incident Log
            </label>
            <textarea
              placeholder="Provide brief notes regarding this early termination..."
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              style={{ width: '100%', height: '60px', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleConfirm}>
            <Scissors size={14} />
            <span>Confirm Cut & Archive</span>
          </button>
        </div>
      </div>
    </div>
  );
}
