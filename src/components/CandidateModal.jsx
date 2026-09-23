import React from 'react';
import { X, Play, Lock, FileText, CheckCircle2, Phone, Mail, GraduationCap } from 'lucide-react';

export default function CandidateModal({ candidate, currentUser, onClose, onStartInterview, onViewScorecard }) {

  if (!candidate) return null;

  const isLockedByOther = candidate.current_status === 'IN_PROGRESS' && 
                          candidate.locked_by_user_id && 
                          candidate.locked_by_user_id !== currentUser?.id;

  const isMyInterview = candidate.current_status === 'IN_PROGRESS' && 
                        candidate.locked_by_user_id === currentUser?.id;

  const isCompleted = candidate.current_status === 'COMPLETED';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--c-primary)' }}>
              {candidate.name}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--c-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
              <span><strong>Roll:</strong> {candidate.roll_no}</span>
              <span>•</span>
              <span>{candidate.branch} ({candidate.division})</span>
              <span>•</span>
              <span><strong>CGPA:</strong> {candidate.cgpa}</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Status Alert if Locked */}
          {isLockedByOther && (
            <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Lock size={16} />
              <span>Locked: <strong>{candidate.locked_by_user_name}</strong> is currently conducting this interview.</span>
            </div>
          )}

          {/* Contact Details */}
          <div className="info-section">
            <div className="info-section-title">
              <FileText size={14} />
              <span>Contact & Identity</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={14} color="var(--c-muted)" />
                <span>{candidate.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={14} color="var(--c-muted)" />
                <span>{candidate.phone}</span>
              </div>
            </div>
          </div>

          {/* Google Form Responses */}
          <div className="info-section">
            <div className="info-section-title">
              <GraduationCap size={14} />
              <span>Google Form Application Responses</span>
            </div>

            {candidate.form_responses && Object.entries(candidate.form_responses).map(([question, answer], idx) => (
              <div key={idx} className="qa-block">
                <div className="qa-question">{question}</div>
                <div className="qa-answer">{answer}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          
          {isLockedByOther ? (
            <button className="btn btn-secondary" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
              <Lock size={14} />
              <span>In Progress by {candidate.locked_by_user_name}</span>
            </button>
          ) : (isCompleted || candidate.current_status === 'CUT') ? (
            <button className="btn btn-secondary" onClick={() => onViewScorecard(candidate.id)}>
              <CheckCircle2 size={14} color="#166534" />
              <span>View Completed Evaluation</span>
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => onStartInterview(candidate.id)}>
              <Play size={14} />
              <span>{isMyInterview ? 'Resume Interview' : 'Start Interview'}</span>
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
