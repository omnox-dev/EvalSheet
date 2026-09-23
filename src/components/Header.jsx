import React from 'react';
import { User, LogOut, RefreshCw, HelpCircle, FileSpreadsheet, LayoutGrid } from 'lucide-react';

export default function Header({ currentUser, onRefresh, currentView, onGoHome, onChangeView, onLogout, onOpenSamplePdf, onOpenMemes }) {

  return (
    <header className="header-topbar">
      <div className="brand-section">
        <div className="brand-badge">EVAL</div>
        <div style={{ cursor: 'pointer' }} onClick={onGoHome}>
          <span className="brand-title">EvalSheet</span>
          <span className="brand-sub">Universal Evaluation Portal</span>
        </div>

        {/* Top Navigation Tabs */}
        {currentView !== 'workspace' && (
          <div style={{ display: 'flex', gap: '0.35rem', marginLeft: '1.25rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
            <button 
              className={`btn btn-sm ${currentView === 'dashboard' ? 'btn-dark' : 'btn-secondary'}`}
              onClick={() => onChangeView('dashboard')}
            >
              <LayoutGrid size={13} />
              <span>Candidate Board</span>
            </button>
            <button 
              className={`btn btn-sm ${currentView === 'questions' ? 'btn-dark' : 'btn-secondary'}`}
              onClick={() => onChangeView('questions')}
            >
              <HelpCircle size={13} />
              <span>Question Bank</span>
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={onOpenSamplePdf}
              title="View and print sample candidate application form PDF"
            >
              <FileSpreadsheet size={13} color="var(--c-accent)" />
              <span>Sample Form PDF</span>
            </button>
          </div>
        )}
      </div>



      <div className="header-actions">
        {currentView !== 'workspace' && (
          <button className="btn btn-secondary btn-sm" onClick={onRefresh} title="Sync board">
            <RefreshCw size={13} />
            <span>Sync</span>
          </button>
        )}

        {/* User Identity & Logout */}
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="interviewer-selector">
              <User size={14} color="var(--c-accent)" />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span style={{ fontWeight: 600, color: 'var(--c-primary)', fontSize: '0.85rem' }}>
                  {currentUser.name}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--c-muted)', textTransform: 'uppercase' }}>
                  {currentUser.role}
                </span>
              </div>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={onLogout}
              title="Sign Out"
              style={{ color: '#991b1b' }}
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
