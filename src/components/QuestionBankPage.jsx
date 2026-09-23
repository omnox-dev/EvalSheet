import React, { useState } from 'react';
import { HelpCircle, Plus, Upload, Download, Trash2, Search, Check, AlertCircle, FileSpreadsheet, X, Sparkles, Copy, Code } from 'lucide-react';
import { api } from '../api/client';
import { SAMPLE_QUESTIONS_JSON, GPT_PROMPT_TEMPLATE } from '../data/sampleQuestions';

// CSV Parser for Questions
function parseQuestionsCSV(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let currentField = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentField.trim());
      if (row.some(f => f.length > 0)) {
        lines.push(row);
      }
      row = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || row.length > 0) {
    row.push(currentField.trim());
    if (row.some(f => f.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

export default function QuestionBankPage({ questions, currentUser, onRefreshQuestions }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  // New Question Form State
  const [newCat, setNewCat] = useState('');
  const [newText, setNewText] = useState('');
  const [newBehavior, setNewBehavior] = useState('');
  const [newFollowup, setNewFollowup] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Import State
  const [importFile, setImportFile] = useState(null);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [importError, setImportError] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const categories = ['ALL', ...Array.from(new Set(questions.map(q => q.category))).filter(Boolean)];

  const filtered = questions.filter(q => {
    const matchSearch = q.question_text.toLowerCase().includes(search.toLowerCase()) || 
                        q.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || q.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setIsSaving(true);
    try {
      await api.addCustomQuestion({
        category: newCat.trim() || 'General',
        question_text: newText.trim(),
        expected_behavior: newBehavior.trim(),
        follow_up: newFollowup.trim(),
        created_by: currentUser?.id
      });
      setNewText('');
      setNewBehavior('');
      setNewFollowup('');
      setIsAddModalOpen(false);
      onRefreshQuestions();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSampleQuestions = async () => {
    if (!confirm('Load the 5 pre-built sample questions into your question bank?')) return;
    try {
      await api.bulkImportQuestions(SAMPLE_QUESTIONS_JSON, currentUser?.id);
      onRefreshQuestions();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this question from the bank?')) return;
    try {
      await api.deleteQuestion(id);
      onRefreshQuestions();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImportFile(f);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        
        // Check if JSON file
        if (f.name.endsWith('.json') || text.trim().startsWith('[')) {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            const valid = json.map(item => ({
              category: item.category || 'General',
              question_text: item.question_text || item.question || '',
              expected_behavior: item.expected_behavior || item.rubric || '',
              follow_up: item.follow_up || ''
            })).filter(q => q.question_text.trim().length > 0);
            setParsedQuestions(valid);
            return;
          }
        }

        // Otherwise CSV Parse
        const rows = parseQuestionsCSV(text);
        if (rows.length < 2) {
          setImportError('File must include a header and at least one question row.');
          return;
        }

        const rawHeaders = rows[0].map(h => h.replace(/^\uFEFF/, '').trim().toLowerCase());
        const dataRows = rows.slice(1);

        const items = dataRows.map(r => {
          let category = 'General';
          let question_text = '';
          let expected_behavior = '';
          let follow_up = '';

          rawHeaders.forEach((h, idx) => {
            const val = r[idx] || '';
            if (h.includes('category') || h.includes('topic') || h.includes('domain')) category = val;
            else if (h.includes('question') || h.includes('prompt') || h.includes('text')) question_text = val;
            else if (h.includes('behavior') || h.includes('rubric') || h.includes('criteria') || h.includes('answer')) expected_behavior = val;
            else if (h.includes('follow') || h.includes('probe')) follow_up = val;
          });

          if (!question_text && r[0]) question_text = r[0];

          return { category: category || 'General', question_text, expected_behavior, follow_up };
        }).filter(item => item.question_text.trim().length > 0);

        setParsedQuestions(items);
      } catch (err) {
        setImportError('Error parsing file: ' + err.message);
      }
    };
    reader.readAsText(f);
  };

  const handleConfirmImport = async () => {
    if (parsedQuestions.length === 0) return;
    setIsImporting(true);
    try {
      await api.bulkImportQuestions(parsedQuestions, currentUser?.id);
      setIsImportModalOpen(false);
      setParsedQuestions([]);
      setImportFile(null);
      onRefreshQuestions();
    } catch (err) {
      setImportError(err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadSampleJSON = () => {
    const blob = new Blob([JSON.stringify(SAMPLE_QUESTIONS_JSON, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_interview_questions.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSampleCSV = () => {
    const sample = `Category,Question Text,Expected Behavior / Rubric Focus,Follow-up Question
HR Communication,"A visiting corporate recruiter complains that multiple shortlisted candidates are not answering their phones or showing up on time. How do you handle this with the HR panel?","Takes immediate ownership without making excuses, offers a transparent 5-minute update window, coordinates with floor coordinators to locate candidates immediately.","What exact words would you use when addressing the recruiter to maintain their confidence in our college drive?"
Crisis Management,"During an online aptitude test in the computer lab, the main network switch goes down for 40 candidates mid-test. What are your immediate operational steps?","Remains calm, instructs candidates not to close browser tabs, coordinates with IT admins for backup connections, and informs the company tech lead proactively.","How do you handle candidates who start panicking about their timer expiring?"
Student Coordination,"An unselected student becomes argumentative in the waiting hallway, accusing the coordinator team of unfair shortlisting. How do you manage this?","Politely separates the student away from other waiting candidates and recruiter earshot, explains policy boundaries calmly, and escalates to faculty lead if needed.","How do you prevent other waiting candidates from becoming agitated or distracted?"
Professionalism & Ethics,"Your close friend or classmate asks you for insider details about the technical interview questions asked in previous slots. How do you respond?","Maintains strict confidentiality and ethics, refuses politely but firmly, explains fairness to all candidates, offers general preparation advice only.","What if they accuse you of being unhelpful or arrogant?"`;

    const blob = new Blob(['\uFEFF' + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_question_bank_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyGPT = () => {
    navigator.clipboard.writeText(GPT_PROMPT_TEMPLATE);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(SAMPLE_QUESTIONS_JSON, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: '1100px' }}>
      {/* Top Banner */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--c-accent)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            <HelpCircle size={15} />
            <span>Interview Library</span>
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--c-primary)' }}>
            Universal Question Bank
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--c-muted)', marginTop: '0.2rem' }}>
            {questions.length} situational, behavioral, and technical interview questions in repository.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setIsPromptModalOpen(true)}>
            <Code size={13} color="var(--c-accent)" />
            <span>GPT Prompt & JSON</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setIsImportModalOpen(true)}>
            <Upload size={13} />
            <span>Import CSV / JSON</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={13} />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Quick Sample Seeder Banner if Question Bank is Empty */}
      {questions.length === 0 && (
        <div style={{ backgroundColor: 'var(--c-accent-subtle)', border: '1px solid rgba(37, 99, 235, 0.2)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--c-primary)', fontSize: '0.95rem' }}>
              Your Question Bank is currently empty.
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--c-muted)', marginTop: '0.2rem' }}>
              You can start with our curated sample question set or import your own JSON/CSV questions.
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleLoadSampleQuestions}>
            <Sparkles size={13} />
            <span>Load Sample Questions (5)</span>
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar" style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}>
        <div className="search-input-wrap">
          <Search size={16} color="var(--c-muted)" />
          <input
            type="text"
            placeholder="Search questions or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-dropdowns">
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="table-wrap">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--c-muted)', fontSize: '0.9rem' }}>
            <HelpCircle size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <div>No questions found. Click <strong>Add Question</strong>, <strong>Load Sample Questions</strong>, or <strong>Import CSV / JSON</strong>.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((q, idx) => (
              <div key={q.id} style={{
                padding: '1.25rem',
                borderBottom: idx === filtered.length - 1 ? 'none' : '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.4rem' }}>
                  <span className="question-category-tag">{q.category}</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDelete(q.id)}
                    title="Delete question"
                    style={{ color: '#991b1b' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--c-primary)', marginBottom: '0.5rem' }}>
                  "{q.question_text}"
                </div>

                {q.expected_behavior && (
                  <div className="question-guide-box" style={{ marginBottom: '0.4rem' }}>
                    <span className="question-guide-label">Rubric & Behavioral Focus:</span>
                    {q.expected_behavior}
                  </div>
                )}

                {q.follow_up && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--c-muted)' }}>
                    <strong>Follow-up Probe:</strong> {q.follow_up}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GPT Prompt & Sample JSON Modal */}
      {isPromptModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPromptModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code size={18} color="var(--c-accent)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--c-primary)' }}>
                  GPT Prompt & Sample JSON Schema
                </h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsPromptModalOpen(false)}>
                <X size={15} />
              </button>
            </div>

            <div className="modal-body">
              {/* ChatGPT Ready Prompt */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-muted)' }}>
                    1. Prompt for ChatGPT / Claude
                  </span>
                  <button className="btn btn-secondary btn-sm" onClick={handleCopyGPT}>
                    {copiedPrompt ? <Check size={12} color="#166534" /> : <Copy size={12} />}
                    <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
                  </button>
                </div>
                <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.8rem', color: '#334155', fontFamily: 'var(--font-mono)', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                  {GPT_PROMPT_TEMPLATE}
                </div>
              </div>

              {/* Sample JSON */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-muted)' }}>
                    2. Sample JSON Structure
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={handleDownloadSampleJSON}>
                      <Download size={12} />
                      <span>Download .JSON</span>
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={handleCopyJSON}>
                      {copiedJson ? <Check size={12} color="#166534" /> : <Copy size={12} />}
                      <span>{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
                    </button>
                  </div>
                </div>
                <div style={{ maxHeight: '180px', overflowY: 'auto', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--c-primary)' }}>
                  <pre>{JSON.stringify(SAMPLE_QUESTIONS_JSON, null, 2)}</pre>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary btn-sm" onClick={() => setIsPromptModalOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--c-primary)' }}>
                Add New Interview Question
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsAddModalOpen(false)}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion}>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Category / Topic
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Crisis Management, Technical Aptitude, HR Rapport"
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Question Prompt
                  </label>
                  <textarea
                    placeholder="Type the situational or interview question prompt..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    style={{ width: '100%', height: '80px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Expected Behavior / Rubric Focus (Optional)
                  </label>
                  <textarea
                    placeholder="What should the interviewer look for in candidate answers?"
                    value={newBehavior}
                    onChange={(e) => setNewBehavior(e.target.value)}
                    style={{ width: '100%', height: '60px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Follow-Up Probe (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Secondary question to dig deeper..."
                    value={newFollowup}
                    onChange={(e) => setNewFollowup(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  <Check size={14} />
                  <span>{isSaving ? 'Saving...' : 'Save Question'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Questions Modal (CSV & JSON) */}
      {isImportModalOpen && (
        <div className="modal-overlay" onClick={() => setIsImportModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileSpreadsheet size={18} color="var(--c-accent)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--c-primary)' }}>
                  Bulk Import Questions (CSV or JSON)
                </h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsImportModalOpen(false)}>
                <X size={15} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.825rem', color: 'var(--c-muted)' }}>
                  Upload a <code>.csv</code> spreadsheet or a <code>.json</code> questions array.
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={handleDownloadSampleJSON}>
                    <Download size={12} />
                    <span>Sample JSON</span>
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={handleDownloadSampleCSV}>
                    <Download size={12} />
                    <span>Sample CSV</span>
                  </button>
                </div>
              </div>

              <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.75rem 1rem', textAlign: 'center', backgroundColor: 'var(--bg-app)', marginBottom: '1.25rem', cursor: 'pointer' }}>
                <input
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  id="q-csv-input"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <label htmlFor="q-csv-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <Upload size={28} color="var(--c-accent)" />
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--c-primary)' }}>
                    {importFile ? importFile.name : 'Select or drop Questions CSV or JSON file'}
                  </div>
                </label>
              </div>

              {importError && (
                <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <AlertCircle size={15} />
                  <span>{importError}</span>
                </div>
              )}

              {parsedQuestions.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-muted)', marginBottom: '0.5rem' }}>
                    {parsedQuestions.length} Questions Ready to Import
                  </div>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                    <table className="corp-table" style={{ fontSize: '0.8rem' }}>
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Question</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedQuestions.map((item, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{item.category}</td>
                            <td>{item.question_text}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsImportModalOpen(false)} disabled={isImporting}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmImport} disabled={parsedQuestions.length === 0 || isImporting}>
                <Check size={14} />
                <span>{isImporting ? 'Importing...' : `Import ${parsedQuestions.length} Questions`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
