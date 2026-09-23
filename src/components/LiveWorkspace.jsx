import React, { useState, useEffect } from 'react';
import { Play, Save, Scissors, CheckCircle, HelpCircle, ArrowLeft, Clock, Mail, Phone, GraduationCap, FileText } from 'lucide-react';
import EvaluationForm from './EvaluationForm';
import FloatingQuestions from './FloatingQuestions';
import CutInterviewModal from './CutInterviewModal';

export default function LiveWorkspace({ 
  interviewData, 
  questions, 
  onAutosaveEvaluation, 
  onFinishInterview, 
  onAddCustomQuestion,
  onUseQuestion,
  onBackToDashboard
}) {
  const [showQuestionModal, setShowQuestionModal] = useState(true);
  const [showCutModal, setShowCutModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const student = interviewData?.student;
  const evaluation = interviewData?.evaluation;
  const usedQuestions = interviewData?.questions || [];

  // Elapsed interview timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveAndExit = () => {
    onFinishInterview('PAUSE');
  };

  const handleComplete = () => {
    onFinishInterview('COMPLETE');
  };

  const handleConfirmCut = (reason) => {
    setShowCutModal(false);
    onFinishInterview('CUT', reason);
  };

  if (!student) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--c-muted)' }}>
        Loading live interview workspace...
      </div>
    );
  }

  return (
    <div className="workspace-container">
      {/* Top Action Bar */}
      <div className="workspace-header">
        <div className="candidate-header-meta">
          <button className="btn btn-secondary btn-sm" onClick={onBackToDashboard} title="Back to Dashboard">
            <ArrowLeft size={14} />
          </button>

          <div>
            <div className="candidate-header-name">
              {student.name}
            </div>
            <div className="candidate-header-tags">
              <span>{student.roll_no}</span>
              <span>•</span>
              <span>{student.branch} ({student.division})</span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--c-accent)', fontWeight: 600 }}>
                <Clock size={12} />
                {formatTimer(elapsedSeconds)}
              </span>
            </div>
          </div>
        </div>

        <div className="workspace-actions">
          <button 
            className={`btn btn-sm ${showQuestionModal ? 'btn-dark' : 'btn-secondary'}`}
            onClick={() => setShowQuestionModal(!showQuestionModal)}
          >
            <HelpCircle size={14} />
            <span>Question Bank</span>
          </button>

          <button className="btn btn-secondary btn-sm" onClick={handleSaveAndExit}>
            <Save size={14} />
            <span>Save & Exit</span>
          </button>

          <button className="btn btn-danger btn-sm" onClick={() => setShowCutModal(true)}>
            <Scissors size={14} />
            <span>Cut Interview</span>
          </button>

          <button className="btn btn-primary btn-sm" onClick={handleComplete}>
            <CheckCircle size={14} />
            <span>Complete & Submit</span>
          </button>
        </div>
      </div>

      {/* Split Pane View */}
      <div className="workspace-split">
        {/* Left: Google Form Responses */}
        <div className="pane-candidate">
          <div className="info-section">
            <div className="info-section-title">
              <FileText size={14} />
              <span>Applicant Profile & Contact</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={14} color="var(--c-muted)" />
                <span>{student.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={14} color="var(--c-muted)" />
                <span>{student.phone}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <div className="info-section-title">
              <GraduationCap size={14} />
              <span>Google Form Application Data</span>
            </div>

            {student.form_responses && Object.entries(student.form_responses).map(([question, answer], idx) => (
              <div key={idx} className="qa-block">
                <div className="qa-question">{question}</div>
                <div className="qa-answer">{answer}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Evaluation Rubric & Autosaving Notes */}
        <div className="pane-evaluation">
          <EvaluationForm 
            initialEvaluation={evaluation}
            onAutosave={onAutosaveEvaluation}
            selectedQuestions={usedQuestions}
          />
        </div>
      </div>

      {/* Floating Draggable Question Modal */}
      <FloatingQuestions
        questions={questions}
        isVisible={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        onUseQuestion={onUseQuestion}
        onAddCustomQuestion={onAddCustomQuestion}
      />

      {/* Standardized Cut-Interview Modal */}
      <CutInterviewModal
        isOpen={showCutModal}
        onClose={() => setShowCutModal(false)}
        onConfirmCut={handleConfirmCut}
      />
    </div>
  );
}
