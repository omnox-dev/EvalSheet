import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CandidateModal from './components/CandidateModal';
import LiveWorkspace from './components/LiveWorkspace';
import ScorecardModal from './components/ScorecardModal';
import QuestionBankPage from './components/QuestionBankPage';
import ImportModal from './components/ImportModal';
import AuthScreen from './components/AuthScreen';
import SampleFormPdfModal from './components/SampleFormPdfModal';
import LandingPage from './components/LandingPage';

import { exportEvaluationsToCSV } from './utils/csvExporter';
import { api } from './api/client';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('evalsheet_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState([]);
  
  // Navigation & Active Session
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'workspace' | 'questions'
  const [showLanding, setShowLanding] = useState(!currentUser);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [scorecardData, setScorecardData] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSamplePdfModalOpen, setIsSamplePdfModalOpen] = useState(false);
  const [activeInterviewSession, setActiveInterviewSession] = useState(null);
  const [errorToast, setErrorToast] = useState(null);
  const [successToast, setSuccessToast] = useState(null);


  const heartbeatRef = useRef(null);

  // Initial Load
  const loadData = async () => {
    if (!currentUser) return;
    try {
      const [s, q] = await Promise.all([
        api.getStudents(),
        api.getQuestions()
      ]);
      setStudents(s);
      setQuestions(q);
    } catch (err) {
      console.error('Failed to load system state:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
      const interval = setInterval(() => {
        api.getStudents().then(setStudents).catch(() => {});
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Heartbeat management during active workspace
  useEffect(() => {
    if (currentView === 'workspace' && activeInterviewSession && currentUser) {
      heartbeatRef.current = setInterval(() => {
        api.sendHeartbeat(activeInterviewSession.student.id, currentUser.id).catch(() => {});
      }, 25000);
    } else {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    }

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [currentView, activeInterviewSession, currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('evalsheet_user');
    setCurrentUser(null);
    setCurrentView('dashboard');
    setActiveInterviewSession(null);
  };

  // Start / Resume Interview
  const handleStartInterview = async (studentId) => {
    if (!currentUser) return;
    try {
      const lockRes = await api.startInterview(studentId, currentUser.id, currentUser.name);
      if (lockRes.success) {
        const sessionData = await api.getInterviewSession(lockRes.interviewId);
        setActiveInterviewSession(sessionData);
        setSelectedCandidate(null);
        setCurrentView('workspace');
        api.getStudents().then(setStudents);
      }
    } catch (err) {
      setErrorToast(err.message);
      setTimeout(() => setErrorToast(null), 5000);
      api.getStudents().then(setStudents);
    }
  };

  // Autosave Evaluation Scores & Notes
  const handleAutosaveEvaluation = async (evalData) => {
    if (!activeInterviewSession) return;
    return api.saveEvaluation(activeInterviewSession.interview.id, evalData);
  };

  // Record Question Used
  const handleUseQuestion = async (question) => {
    if (!activeInterviewSession) return;
    try {
      await api.recordInterviewQuestion(
        activeInterviewSession.interview.id,
        question.id,
        question.modified_text || question.question_text,
        question.category
      );
      const updated = await api.getInterviewSession(activeInterviewSession.interview.id);
      setActiveInterviewSession(updated);
    } catch (err) {
      console.error('Failed to record question:', err);
    }
  };

  // Add Custom Question to Global Bank
  const handleAddCustomQuestion = async (data) => {
    try {
      await api.addCustomQuestion({ ...data, created_by: currentUser?.id });
      const q = await api.getQuestions();
      setQuestions(q);
    } catch (err) {
      console.error('Failed to add custom question:', err);
    }
  };

  // Finish Interview (PAUSE / COMPLETE / CUT)
  const handleFinishInterview = async (action, cutReason = null) => {
    if (!activeInterviewSession) return;
    try {
      await api.finishInterview(activeInterviewSession.interview.id, action, cutReason);
      setActiveInterviewSession(null);
      setCurrentView('dashboard');
      loadData();
    } catch (err) {
      console.error('Failed to finalize interview:', err);
    }
  };

  // View Completed Evaluation Scorecard
  const handleViewScorecard = async (studentId) => {
    try {
      const data = await api.getStudentEvaluation(studentId);
      setScorecardData(data);
      setSelectedCandidate(null);
    } catch (err) {
      setErrorToast(err.message);
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  // Bulk CSV Import
  const handleBulkImport = async (candidatesList) => {
    try {
      const res = await api.bulkImportStudents(candidatesList);
      setSuccessToast(`Successfully imported ${res.count} candidates into the database.`);
      setTimeout(() => setSuccessToast(null), 5000);
      loadData();
    } catch (err) {
      setErrorToast(err.message);
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  // Export to Excel / CSV
  const handleExportExcel = async () => {
    try {
      const data = await api.getExportData();
      exportEvaluationsToCSV(data);
    } catch (err) {
      setErrorToast(err.message);
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  // Clear All Candidates (Admin Only)
  const handleClearAllCandidates = async () => {
    if (!currentUser) return;
    try {
      const res = await api.clearAllStudents(currentUser.role);
      setSuccessToast(res.message || 'All candidate records cleared successfully.');
      setTimeout(() => setSuccessToast(null), 5000);
      loadData();
    } catch (err) {
      setErrorToast(err.message);
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  // If user is not authenticated:
  if (!currentUser) {
    if (showLanding) {
      return (
        <LandingPage 
          onGetStarted={() => setShowLanding(false)} 
        />
      );
    }
    return (
      <>
        <div style={{ position: 'fixed', top: '15px', right: '20px', zIndex: 100 }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowLanding(true)}
          >
            <span>&larr; Overview / First Page</span>
          </button>
        </div>
        <AuthScreen onAuthSuccess={(user) => {
          setCurrentUser(user);
          setShowLanding(false);
        }} />
      </>
    );
  }

  return (
    <div>
      {/* Top corporate navigation */}
      <Header
        currentUser={currentUser}
        onRefresh={loadData}
        currentView={currentView}
        onChangeView={setCurrentView}
        onLogout={handleLogout}
        onOpenSamplePdf={() => setIsSamplePdfModalOpen(true)}
        onGoHome={() => {
          if (currentView === 'workspace') {
            handleFinishInterview('PAUSE');
          } else {
            setCurrentView('dashboard');
          }
        }}
      />


      {/* Success Toast */}
      {successToast && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '20px',
          zIndex: 100,
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-md)',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          {successToast}
        </div>
      )}

      {/* Error Toast Notification */}
      {errorToast && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '20px',
          zIndex: 100,
          backgroundColor: '#fff1f2',
          border: '1px solid #fecdd3',
          color: '#9f1239',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-md)',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          {errorToast}
        </div>
      )}

      {/* Main Views */}
      {currentView === 'dashboard' && (
        <Dashboard
          students={students}
          currentUser={currentUser}
          onSelectCandidate={setSelectedCandidate}
          onStartInterview={handleStartInterview}
          onViewScorecard={handleViewScorecard}
          onOpenImport={() => setIsImportModalOpen(true)}
          onExportExcel={handleExportExcel}
          onClearAll={handleClearAllCandidates}
        />
      )}

      {currentView === 'questions' && (
        <QuestionBankPage
          questions={questions}
          currentUser={currentUser}
          onRefreshQuestions={loadData}
        />
      )}

      {currentView === 'workspace' && activeInterviewSession && (

        <LiveWorkspace
          interviewData={activeInterviewSession}
          questions={questions}
          onAutosaveEvaluation={handleAutosaveEvaluation}
          onFinishInterview={handleFinishInterview}
          onAddCustomQuestion={handleAddCustomQuestion}
          onUseQuestion={handleUseQuestion}
          onBackToDashboard={() => handleFinishInterview('PAUSE')}
        />
      )}

      {/* Full Candidate Application Review Modal */}
      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          currentUser={currentUser}
          onClose={() => setSelectedCandidate(null)}
          onStartInterview={handleStartInterview}
          onViewScorecard={handleViewScorecard}
        />
      )}

      {/* Completed Evaluation Scorecard Modal */}
      {scorecardData && (
        <ScorecardModal
          data={scorecardData}
          onClose={() => setScorecardData(null)}
        />
      )}

      {/* Bulk CSV Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleBulkImport}
      />

      {/* Ideal Google Form Sample PDF Modal */}
      <SampleFormPdfModal
        isOpen={isSamplePdfModalOpen}
        onClose={() => setIsSamplePdfModalOpen(false)}
      />
    </div>
  );
}

