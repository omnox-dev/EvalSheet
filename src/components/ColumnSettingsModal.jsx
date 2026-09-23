import React from 'react';
import { X, SlidersHorizontal, RotateCcw, Check } from 'lucide-react';

export const ALL_COLUMNS = [
  { key: 'roll_no', label: 'Roll Number / PRN', default: true },
  { key: 'name', label: 'Candidate Name', default: true },
  { key: 'branch', label: 'Branch / Department', default: true },
  { key: 'division', label: 'Division / Section', default: true },
  { key: 'cgpa', label: 'Aggregate CGPA', default: true },
  { key: 'phone', label: 'Contact Phone Number', default: false },
  { key: 'current_status', label: 'Interview Status & Lock', default: true },
  { key: 'actions', label: 'Actions (Details / Start / Scores)', default: true }
];

export default function ColumnSettingsModal({ isOpen, onClose, visibleColumns, onSaveColumns, onResetDefaults }) {
  if (!isOpen) return null;

  const handleToggle = (key) => {
    if (key === 'name' || key === 'actions') return; // Mandatory columns
    if (visibleColumns.includes(key)) {
      onSaveColumns(visibleColumns.filter(k => k !== key));
    } else {
      onSaveColumns([...visibleColumns, key]);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={16} color="var(--c-accent)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--c-primary)' }}>
              Customize Table Columns
            </h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.825rem', color: 'var(--c-muted)', marginBottom: '1rem' }}>
            Select which candidate columns to display on your interview dashboard table:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ALL_COLUMNS.map(col => {
              const isChecked = visibleColumns.includes(col.key);
              const isMandatory = col.key === 'name' || col.key === 'actions';

              return (
                <label
                  key={col.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: isChecked ? 'var(--bg-surface)' : 'var(--bg-app)',
                    cursor: isMandatory ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  <span style={{ fontWeight: isChecked ? 600 : 400, color: 'var(--c-primary)' }}>
                    {col.label} {isMandatory && <span style={{ fontSize: '0.7rem', color: 'var(--c-muted)' }}>(Required)</span>}
                  </span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isMandatory}
                    onChange={() => handleToggle(col.key)}
                  />
                </label>
              );
            })}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-secondary btn-sm" onClick={onResetDefaults}>
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            <Check size={13} />
            <span>Apply Columns</span>
          </button>
        </div>
      </div>
    </div>
  );
}
