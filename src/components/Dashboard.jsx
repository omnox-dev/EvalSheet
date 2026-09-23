import React, { useState, useEffect } from 'react';
import { Search, Lock, Play, Eye, CheckCircle2, Upload, Download, SlidersHorizontal, Trash2, ShieldAlert } from 'lucide-react';
import ColumnSettingsModal, { ALL_COLUMNS } from './ColumnSettingsModal';
import ClearCandidatesModal from './ClearCandidatesModal';

const DEFAULT_VISIBLE_COLUMNS = ['roll_no', 'name', 'branch', 'division', 'cgpa', 'current_status', 'actions'];

export default function Dashboard({ 
  students, 
  currentUser, 
  onSelectCandidate, 
  onStartInterview, 
  onViewScorecard,
  onOpenImport,
  onExportExcel,
  onClearAll
}) {
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'HEAD_INTERVIEWER';


  // Column preferences with LocalStorage persistence
  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const saved = localStorage.getItem('evalsheet_columns');
      return saved ? JSON.parse(saved) : DEFAULT_VISIBLE_COLUMNS;
    } catch {
      return DEFAULT_VISIBLE_COLUMNS;
    }
  });

  const handleSaveColumns = (cols) => {
    setVisibleColumns(cols);
    try {
      localStorage.setItem('evalsheet_columns', JSON.stringify(cols));
    } catch {}
  };

  const handleResetColumns = () => {
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
    try {
      localStorage.setItem('evalsheet_columns', JSON.stringify(DEFAULT_VISIBLE_COLUMNS));
    } catch {}
  };

  // Metrics
  const total = students.length;
  const readyCount = students.filter(s => s.current_status === 'READY').length;
  const activeCount = students.filter(s => s.current_status === 'IN_PROGRESS').length;
  const completedCount = students.filter(s => s.current_status === 'COMPLETED').length;

  // Filtered list
  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                        s.roll_no.toLowerCase().includes(search.toLowerCase());
    const matchBranch = branchFilter === 'ALL' || s.branch === branchFilter;
    const matchStatus = statusFilter === 'ALL' || s.current_status === statusFilter;
    return matchSearch && matchBranch && matchStatus;
  });

  const branches = Array.from(new Set(students.map(s => s.branch))).filter(Boolean);

  const isColVisible = (colKey) => visibleColumns.includes(colKey);

  return (
    <div className="dashboard-container">
      {/* Metrics Strip */}
      <div className="metrics-strip">
        <div className="metric-card">
          <div className="metric-label">Total Applicants</div>
          <div className="metric-value">{total}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Ready for Interview</div>
          <div className="metric-value accent">{readyCount}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Active / In Progress</div>
          <div className="metric-value">{activeCount}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Completed</div>
          <div className="metric-value">{completedCount}</div>
        </div>
      </div>

      {/* Filter & Action Controls Bar */}
      <div className="filter-bar" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="search-input-wrap">
          <Search size={16} color="var(--c-muted)" />
          <input 
            type="text" 
            placeholder="Search by candidate name or roll number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-dropdowns" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <select 
            className="filter-select"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            {branches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="READY">Ready</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
            <option value="CUT">Cut</option>
          </select>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setIsColumnModalOpen(true)}
            title="Choose which columns to show"
          >
            <SlidersHorizontal size={13} />
            <span>Columns</span>
          </button>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenImport}
            title="Import candidate list from CSV spreadsheet"
          >
            <Upload size={13} />
            <span>Import CSV</span>
          </button>

          <button 
            className="btn btn-primary btn-sm"
            onClick={onExportExcel}
            title="Export full candidate evaluations to Excel CSV"
          >
            <Download size={13} />
            <span>Export Excel</span>
          </button>

          {isAdmin && (
            <button 
              className="btn btn-danger btn-sm"
              onClick={() => setIsClearModalOpen(true)}
              title="Admin Only: Remove all candidates and reset board"
            >
              <Trash2 size={13} />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>


      {/* Candidate Table with Dynamic Columns */}
      <div className="table-wrap">
        <table className="corp-table">
          <thead>
            <tr>
              {isColVisible('roll_no') && <th style={{ width: '120px' }}>Roll No.</th>}
              {isColVisible('name') && <th>Candidate Name</th>}
              {isColVisible('branch') && <th>Branch / Department</th>}
              {isColVisible('division') && <th>Division</th>}
              {isColVisible('cgpa') && <th>CGPA</th>}
              {isColVisible('phone') && <th>Contact Phone</th>}
              {isColVisible('current_status') && <th>Interview Status</th>}
              {isColVisible('actions') && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--c-muted)' }}>
                  No candidates match the specified filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map(student => {
                const isLockedByOther = student.current_status === 'IN_PROGRESS' && 
                                        student.locked_by_user_id && 
                                        student.locked_by_user_id !== currentUser?.id;

                const isMySession = student.current_status === 'IN_PROGRESS' && 
                                    student.locked_by_user_id === currentUser?.id;

                return (
                  <tr key={student.id}>
                    {isColVisible('roll_no') && (
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {student.roll_no}
                      </td>
                    )}

                    {isColVisible('name') && (
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--c-primary)' }}>
                          {student.name}
                        </div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--c-muted)' }}>
                          {student.email}
                        </div>
                      </td>
                    )}

                    {isColVisible('branch') && (
                      <td>{student.branch}</td>
                    )}

                    {isColVisible('division') && (
                      <td>{student.division}</td>
                    )}

                    {isColVisible('cgpa') && (
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {student.cgpa || '—'}
                      </td>
                    )}

                    {isColVisible('phone') && (
                      <td style={{ fontSize: '0.8rem', color: 'var(--c-muted)' }}>
                        {student.phone || '—'}
                      </td>
                    )}

                    {isColVisible('current_status') && (
                      <td>
                        {student.current_status === 'READY' && (
                          <span className="badge badge-ready">Ready</span>
                        )}
                        {student.current_status === 'IN_PROGRESS' && (
                          isLockedByOther ? (
                            <span className="badge badge-locked" title={`Locked by ${student.locked_by_user_name}`}>
                              <Lock size={12} />
                              <span>Locked: {student.locked_by_user_name}</span>
                            </span>
                          ) : (
                            <span className="badge badge-active">
                              <Play size={12} />
                              <span>My Interview</span>
                            </span>
                          )
                        )}
                        {student.current_status === 'PAUSED' && (
                          <span className="badge badge-ready" style={{ color: 'var(--c-accent)', borderColor: 'var(--c-accent)' }}>
                            Paused
                          </span>
                        )}
                        {student.current_status === 'COMPLETED' && (
                          <span className="badge badge-completed">
                            <CheckCircle2 size={12} />
                            <span>Completed</span>
                          </span>
                        )}
                        {student.current_status === 'CUT' && (
                          <span className="badge badge-cut">Cut</span>
                        )}
                      </td>
                    )}

                    {isColVisible('actions') && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => onSelectCandidate(student)}
                            title="View Application Details"
                          >
                            <Eye size={13} />
                            <span>Details</span>
                          </button>

                          {isLockedByOther ? (
                            <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                              <Lock size={13} />
                              <span>Locked</span>
                            </button>
                          ) : (student.current_status === 'COMPLETED' || student.current_status === 'CUT') ? (
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => onViewScorecard(student.id)}
                            >
                              <CheckCircle2 size={13} color="#166534" />
                              <span>Scores</span>
                            </button>
                          ) : (
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => onStartInterview(student.id)}
                            >
                              <Play size={13} />
                              <span>{isMySession ? 'Resume' : 'Start'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Column Customizer Modal */}
      <ColumnSettingsModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        visibleColumns={visibleColumns}
        onSaveColumns={handleSaveColumns}
        onResetDefaults={handleResetColumns}
      />

      {/* Admin Clear All Confirmation Modal */}
      <ClearCandidatesModal
        isOpen={isClearModalOpen}
        candidateCount={students.length}
        onClose={() => setIsClearModalOpen(false)}
        onConfirmClear={onClearAll}
      />
    </div>
  );
}

