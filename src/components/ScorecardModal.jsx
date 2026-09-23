import React from 'react';
import { X, CheckCircle2, User, Clock, Scissors, Award, Printer } from 'lucide-react';

const CRITERIA_MAP = [
  { key: 'communication', label: 'Communication & Articulation' },
  { key: 'coordination', label: 'Coordination & Logistics' },
  { key: 'problem_solving', label: 'Problem Solving & Crisis Handling' },
  { key: 'professionalism', label: 'Professionalism & Ethics' },
  { key: 'hr_communication', label: 'HR & Recruiter Rapport' }
];

export default function ScorecardModal({ data, onClose }) {
  if (!data) return null;

  const { student, interview, evaluation, questions } = data;

  const isCut = interview.status === 'CUT';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        {/* Header */}
        <div className="modal-header" style={{ backgroundColor: isCut ? '#f8fafc' : '#f0fdf4', borderBottomColor: isCut ? 'var(--border-color)' : '#bbf7d0' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isCut ? (
                <span className="badge badge-cut">Interview Terminated</span>
              ) : (
                <span className="badge badge-completed">
                  <CheckCircle2 size={12} />
                  <span>Evaluation Completed</span>
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--c-primary)', marginTop: '0.25rem' }}>
              {student?.name}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--c-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.15rem' }}>
              <span><strong>Roll:</strong> {student?.roll_no}</span>
              <span>•</span>
              <span>{student?.branch} ({student?.division})</span>
              <span>•</span>
              <span><strong>CGPA:</strong> {student?.cgpa}</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Interview Metadata */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-subtle)', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--c-primary)' }}>
              <User size={14} color="var(--c-accent)" />
              <span><strong>Interviewer:</strong> {interview?.interviewer_name || 'Coordinator'}</span>
            </div>
            {interview?.ended_at && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--c-muted)' }}>
                <Clock size={14} />
                <span>{new Date(interview.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>

          {/* If Cut: Show Reason */}
          {isCut && interview?.cut_reason && (
            <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <strong>Cut Reason:</strong> {interview.cut_reason}
            </div>
          )}

          {/* Evaluation Scores Table */}
          {evaluation && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-muted)', marginBottom: '0.5rem' }}>
                Rubric Score Breakdown
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <tbody>
                  {CRITERIA_MAP.map(crit => {
                    const score = evaluation[crit.key] || 0;
                    return (
                      <tr key={crit.key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.5rem 0', color: 'var(--c-primary)', fontWeight: 500 }}>
                          {crit.label}
                        </td>
                        <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>
                          <span style={{ 
                            display: 'inline-block',
                            width: '28px',
                            height: '28px',
                            lineHeight: '28px',
                            textAlign: 'center',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: score > 0 ? 'var(--c-accent-subtle)' : 'var(--bg-subtle)',
                            color: score > 0 ? 'var(--c-accent)' : 'var(--c-muted)',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)'
                          }}>
                            {score > 0 ? score : '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Total Score Banner */}
              <div className="score-summary-bar" style={{ marginTop: '0.75rem' }}>
                <div>
                  <div className="score-summary-label">OVERALL AVERAGE SCORE</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--c-muted)' }}>Normalized placement suitability</div>
                </div>
                <div className="score-summary-total">
                  {evaluation.total_score} <span style={{ fontSize: '0.85rem', color: 'var(--c-muted)' }}>/ 5.0</span>
                </div>
              </div>
            </div>
          )}

          {/* Qualitative Notes */}
          {evaluation?.notes && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-muted)', marginBottom: '0.4rem' }}>
                Interviewer Observations & Notes
              </div>
              <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.875rem', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {evaluation.notes}
              </div>
            </div>
          )}

          {/* Questions Evaluated */}
          {questions && questions.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-muted)', marginBottom: '0.4rem' }}>
                Questions Recorded in this Interview ({questions.length})
              </div>
              {questions.map((q, idx) => (
                <div key={idx} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.6rem', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--c-accent)' }}>Q{idx + 1}: </span>
                  <span>{q.modified_text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={14} />
            <span>Print Scorecard</span>
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
