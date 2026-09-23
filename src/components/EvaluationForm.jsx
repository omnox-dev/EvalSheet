import React, { useState, useEffect, useRef } from 'react';
import { Check, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const CRITERIA = [
  { key: 'communication', label: 'Communication & Articulation', desc: 'Clarity of thought, active listening, structured answers' },
  { key: 'coordination', label: 'Coordination & Logistics', desc: 'Operations stamina, spreadsheet agility, crowd management' },
  { key: 'problem_solving', label: 'Problem Solving & Crisis Handling', desc: 'Composure under recruiter pressure, rapid de-escalation' },
  { key: 'professionalism', label: 'Professionalism & Ethics', desc: 'Confidentiality, punctuality, formal corporate demeanor' },
  { key: 'hr_communication', label: 'HR & Recruiter Rapport', desc: 'Corporate tact, customer-service mindset with visiting panels' }
];

export default function EvaluationForm({ initialEvaluation, onAutosave, selectedQuestions = [] }) {
  const [evaluation, setEvaluation] = useState({
    communication: 0,
    coordination: 0,
    problem_solving: 0,
    professionalism: 0,
    hr_communication: 0,
    notes: '',
    ...initialEvaluation
  });

  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving' | 'saved' | 'idle'
  const isFirstRender = useRef(true);
  const timerRef = useRef(null);

  // Sync state if initialEvaluation changes
  useEffect(() => {
    if (initialEvaluation) {
      setEvaluation(prev => ({ ...prev, ...initialEvaluation }));
    }
  }, [initialEvaluation]);

  // Debounced Autosave
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSaveStatus('saving');
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        await onAutosave(evaluation);
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('error');
      }
    }, 500);

    return () => clearTimeout(timerRef.current);
  }, [evaluation]);

  const handleScoreSelect = (key, score) => {
    setEvaluation(prev => ({
      ...prev,
      [key]: prev[key] === score ? 0 : score
    }));
  };

  const handleNotesChange = (e) => {
    setEvaluation(prev => ({
      ...prev,
      notes: e.target.value
    }));
  };

  // Compute live average
  const activeScores = [
    evaluation.communication,
    evaluation.coordination,
    evaluation.problem_solving,
    evaluation.professionalism,
    evaluation.hr_communication
  ].filter(s => s > 0);

  const averageScore = activeScores.length > 0 
    ? (activeScores.reduce((a, b) => a + b, 0) / activeScores.length).toFixed(2)
    : '0.00';

  return (
    <div className="rubric-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-primary)' }}>
          Candidate Evaluation Rubric
        </h3>
        <div className="autosave-indicator">
          {saveStatus === 'saving' && (
            <>
              <Clock size={12} color="var(--c-accent)" />
              <span style={{ color: 'var(--c-accent)' }}>Autosaving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <CheckCircle2 size={12} color="#166534" />
              <span style={{ color: '#166534' }}>All changes saved</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <AlertCircle size={12} color="#991b1b" />
              <span style={{ color: '#991b1b' }}>Save failed (retrying)</span>
            </>
          )}
        </div>
      </div>

      {/* 5-Criterion Rubric Rows */}
      {CRITERIA.map(crit => (
        <div key={crit.key} className="rubric-row">
          <div className="rubric-label-wrap">
            <div className="rubric-name">{crit.label}</div>
            <div className="rubric-desc">{crit.desc}</div>
          </div>
          
          <div className="score-selector">
            {[1, 2, 3, 4, 5].map(score => {
              const isSelected = evaluation[crit.key] === score;
              return (
                <button
                  key={score}
                  type="button"
                  className={`score-btn ${isSelected ? 'active accent' : ''}`}
                  onClick={() => handleScoreSelect(crit.key, score)}
                >
                  {score}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Score Summary Total */}
      <div className="score-summary-bar">
        <div>
          <div className="score-summary-label">OVERALL EVALUATION SCORE</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--c-muted)' }}>
            Average of {activeScores.length} / 5 completed criteria
          </div>
        </div>
        <div className="score-summary-total">
          {averageScore} <span style={{ fontSize: '0.9rem', color: 'var(--c-muted)', fontWeight: 500 }}>/ 5.0</span>
        </div>
      </div>

      {/* Notes & Interview Transcript Records */}
      <div style={{ marginTop: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-primary)' }}>
            Qualitative Observations & Interview Notes
          </label>
        </div>
        
        <textarea
          className="notes-textarea"
          placeholder="Type notes on candidate responses, leadership instincts, or recruiter suitability here..."
          value={evaluation.notes || ''}
          onChange={handleNotesChange}
        />
      </div>

      {/* Questions Used during this session */}
      {selectedQuestions.length > 0 && (
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-muted)', marginBottom: '0.5rem' }}>
            Questions Asked in this Session ({selectedQuestions.length})
          </div>
          {selectedQuestions.map((q, idx) => (
            <div key={idx} style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--c-accent)' }}>Q{idx + 1} ({q.category}): </span>
              <span>{q.modified_text || q.question_text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
