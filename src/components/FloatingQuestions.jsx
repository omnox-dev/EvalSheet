import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, ChevronLeft, ChevronRight, Edit3, Check, Plus, X, Move, Sparkles } from 'lucide-react';

export default function FloatingQuestions({ questions, onUseQuestion, onAddCustomQuestion, isVisible, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newQuestionCategory, setNewQuestionCategory] = useState('HR Communication');
  const [newQuestionText, setNewQuestionText] = useState('');

  // Dragging State
  const [pos, setPos] = useState({ x: window.innerWidth - 480, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const categories = ['ALL', ...Array.from(new Set(questions.map(q => q.category)))];

  const filteredQuestions = selectedCategory === 'ALL'
    ? questions
    : questions.filter(q => q.category === selectedCategory);

  const currentQ = filteredQuestions[currentIndex] || questions[0];

  useEffect(() => {
    if (currentQ) {
      setEditedText(currentQ.question_text);
      setIsEditing(false);
    }
  }, [currentIndex, selectedCategory, questions]);

  // Handle Dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('select')) {
      return;
    }
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: pos.x,
      initialY: pos.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      
      const newX = Math.max(10, Math.min(window.innerWidth - 460, dragRef.current.initialX + dx));
      const newY = Math.max(70, Math.min(window.innerHeight - 300, dragRef.current.initialY + dy));
      
      setPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isVisible) return null;

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(filteredQuestions.length - 1);
    }
  };

  const handleApplyEditAndUse = () => {
    onUseQuestion({
      ...currentQ,
      modified_text: editedText
    });
    setIsEditing(false);
  };

  const handleCreateCustom = () => {
    if (!newQuestionText.trim()) return;
    onAddCustomQuestion({
      category: newQuestionCategory,
      question_text: newQuestionText
    });
    setNewQuestionText('');
    setIsAddingNew(false);
  };

  return (
    <div 
      className="floating-modal-wrap"
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
    >
      {/* Header / Drag Bar */}
      <div className="floating-header" onMouseDown={handleMouseDown}>
        <div className="floating-title">
          <Move size={14} />
          <span>Question Bank & Guide</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', opacity: 0.8 }}>
            {filteredQuestions.length > 0 ? `${currentIndex + 1} / ${filteredQuestions.length}` : '0/0'}
          </span>
          <button 
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
            onClick={onClose}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Category selector */}
      <div style={{ padding: '0.5rem 0.9rem', backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <select 
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentIndex(0);
          }}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, outline: 'none', flex: 1 }}
        >
          {categories.map(c => (
            <option key={c} value={c}>{c === 'ALL' ? 'All Question Categories' : c}</option>
          ))}
        </select>

        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => setIsAddingNew(!isAddingNew)}
          title="Add Custom Question"
        >
          <Plus size={13} />
          <span>New</span>
        </button>
      </div>

      {/* Body */}
      <div className="floating-body">
        {isAddingNew ? (
          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--c-primary)' }}>
              Add Custom Question
            </div>
            <select
              value={newQuestionCategory}
              onChange={(e) => setNewQuestionCategory(e.target.value)}
              style={{ width: '100%', marginBottom: '0.5rem', padding: '0.3rem', fontSize: '0.8rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
            >
              <option value="HR Communication">HR Communication</option>
              <option value="Crisis Management">Crisis Management</option>
              <option value="Student Coordination">Student Coordination</option>
              <option value="Professionalism & Ethics">Professionalism & Ethics</option>
              <option value="General & Motivation">General & Motivation</option>
            </select>
            <textarea
              placeholder="Enter your custom situational question..."
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              style={{ width: '100%', height: '70px', padding: '0.4rem', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none', marginBottom: '0.5rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsAddingNew(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleCreateCustom}>Save Question</button>
            </div>
          </div>
        ) : currentQ ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span className="question-category-tag">{currentQ.category}</span>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditing(!isEditing)}
                title="Modify phrasing for this candidate"
              >
                <Edit3 size={12} />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Phrasing'}</span>
              </button>
            </div>

            {isEditing ? (
              <div style={{ marginBottom: '0.75rem' }}>
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  style={{ width: '100%', height: '80px', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid var(--c-accent)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: '0.35rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={handleApplyEditAndUse}>
                    <Check size={12} />
                    <span>Apply & Note</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="question-prompt">
                "{currentQ.question_text}"
              </div>
            )}

            {currentQ.expected_behavior && (
              <div className="question-guide-box">
                <span className="question-guide-label">Expected Behavior / Rubric Focus:</span>
                {currentQ.expected_behavior}
              </div>
            )}

            {currentQ.follow_up && (
              <div style={{ fontSize: '0.775rem', color: 'var(--c-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                <strong>Follow-up Probe:</strong> {currentQ.follow_up}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--c-muted)', fontSize: '0.85rem' }}>
            No questions found in this category.
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="floating-footer">
        <button className="btn btn-secondary btn-sm" onClick={handlePrev} disabled={filteredQuestions.length <= 1}>
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>

        {currentQ && !isAddingNew && !isEditing && (
          <button 
            className="btn btn-dark btn-sm" 
            onClick={() => onUseQuestion(currentQ)}
            title="Add this question to interview notes"
          >
            <Sparkles size={13} />
            <span>Insert Question</span>
          </button>
        )}

        <button className="btn btn-secondary btn-sm" onClick={handleNext} disabled={filteredQuestions.length <= 1}>
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
