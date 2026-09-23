import React, { useState } from 'react';
import { X, Printer, Download, FileSpreadsheet, Check, Copy, Code, HelpCircle, Table, Sparkles } from 'lucide-react';

const GOOGLE_FORM_COLUMNS = [
  {
    exactTitle: "Full Name",
    formType: "Short answer",
    evalField: "name (Candidate Name)",
    isRequired: true,
    sample: "Alex Morgan"
  },
  {
    exactTitle: "Roll Number",
    formType: "Short answer",
    evalField: "roll_no (Roll No / Candidate ID)",
    isRequired: true,
    sample: "2024-ENG-042"
  },
  {
    exactTitle: "Department",
    formType: "Dropdown / Short answer",
    evalField: "branch (Branch / Domain / Department)",
    isRequired: true,
    sample: "Computer Science & Engineering"
  },
  {
    exactTitle: "Division",
    formType: "Short answer",
    evalField: "division (Division / Cohort / Section)",
    isRequired: true,
    sample: "Section A"
  },
  {
    exactTitle: "Current Aggregate CGPA",
    formType: "Short answer (Number)",
    evalField: "cgpa (Academic CGPA / Score)",
    isRequired: false,
    sample: "8.92"
  },
  {
    exactTitle: "Official College Email",
    formType: "Short answer (Email)",
    evalField: "email (Email Address)",
    isRequired: true,
    sample: "alex.morgan@university.edu"
  },
  {
    exactTitle: "Contact Phone (WhatsApp)",
    formType: "Short answer",
    evalField: "phone (Contact Number)",
    isRequired: true,
    sample: "+1 (555) 234-5678"
  },
  {
    exactTitle: "Why are you applying for this role / position?",
    formType: "Paragraph",
    evalField: "form_responses (Motivation & Role Intent)",
    isRequired: true,
    sample: "I bring a strong background in analytical problem solving and team coordination..."
  },
  {
    exactTitle: "Key strengths & prior relevant experience",
    formType: "Paragraph",
    evalField: "form_responses (Prior Experience & Strengths)",
    isRequired: true,
    sample: "Led a 5-member team on an end-to-end data pipeline; coordinated technical symposium..."
  },
  {
    exactTitle: "Describe a challenging situation you handled under tight deadlines",
    formType: "Paragraph",
    evalField: "form_responses (Situational & Crisis Handling)",
    isRequired: true,
    sample: "When a critical API broke 2 hours before demo, I led the triage and deployed a fallback..."
  },
  {
    exactTitle: "Availability and scheduling constraints",
    formType: "Multiple choice",
    evalField: "form_responses (Availability Declaration)",
    isRequired: true,
    sample: "100% Available & Flexible"
  }
];

const APPS_SCRIPT_CODE = `function createEvalSheetGoogleForm() {
  var form = FormApp.create('Placement Coordinator Application Form 2024-25');
  form.setDescription('Official application for Student Placement Coordinators. Responses sync directly to the EvalSheet system.');

  // Academic & Identification
  form.addTextItem().setTitle('Full Name').setRequired(true);
  form.addTextItem().setTitle('Roll Number').setRequired(true);
  form.addListItem().setTitle('Department').setChoiceValues([
    'Computer Engineering',
    'Information Technology',
    'Electronics & Telecommunication',
    'Mechanical Engineering',
    'Civil Engineering'
  ]).setRequired(true);
  form.addTextItem().setTitle('Division').setRequired(true);
  form.addTextItem().setTitle('Current Aggregate CGPA').setRequired(true);
  form.addTextItem().setTitle('Official College Email').setRequired(true);
  form.addTextItem().setTitle('Contact Phone (WhatsApp)').setRequired(true);

  // Qualitative & Situational Questions
  form.addParagraphTextItem().setTitle('Why do you want to become a placement coordinator?').setRequired(true);
  form.addParagraphTextItem().setTitle('Previous leadership / coordination experience').setRequired(true);
  form.addParagraphTextItem().setTitle('A recruiter tells you that several students are not following instructions or dress code. How do you respond?').setRequired(true);
  
  // Availability
  form.addMultipleChoiceItem().setTitle('Availability during peak placement season').setChoiceValues([
    '100% Available (Early mornings & evening debriefs)',
    'Available with minor academic timetable constraints',
    'Limited availability'
  ]).setRequired(true);

  Logger.log('Published Form URL: ' + form.getPublishedUrl());
  Logger.log('Edit Form URL: ' + form.getEditUrl());
}`;

export default function SampleFormPdfModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('columns'); // 'columns' | 'script' | 'pdf'
  const [copiedTitles, setCopiedTitles] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const handleCopyTitles = () => {
    const text = GOOGLE_FORM_COLUMNS.map((c, i) => `${i + 1}. ${c.exactTitle} (${c.formType})`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedTitles(true);
    setTimeout(() => setCopiedTitles(false), 2500);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleDownloadTemplateCSV = () => {
    const headers = [
      'Timestamp',
      ...GOOGLE_FORM_COLUMNS.map(c => c.exactTitle)
    ];

    const escapeCSV = (f) => `"${String(f || '').replace(/"/g, '""')}"`;
    const headerRow = headers.map(escapeCSV).join(',');
    
    // Sample row
    const sampleRow = [
      escapeCSV(new Date().toISOString()),
      ...GOOGLE_FORM_COLUMNS.map(c => escapeCSV(c.sample))
    ].join(',');

    const csvContent = '\uFEFF' + [headerRow, sampleRow].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'google_form_responses_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', maxHeight: '90vh' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSpreadsheet size={18} color="var(--c-accent)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--c-primary)' }}>
              Google Form Column Blueprint & Sample Form
            </h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)' }}>
          <button
            className={`btn btn-sm ${activeTab === 'columns' ? 'btn-dark' : 'btn-secondary'}`}
            style={{ borderRadius: 0, border: 'none', padding: '0.6rem 1rem' }}
            onClick={() => setActiveTab('columns')}
          >
            <Table size={13} />
            <span>Exact Column Blueprint</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'guide' ? 'btn-dark' : 'btn-secondary'}`}
            style={{ borderRadius: 0, border: 'none', padding: '0.6rem 1rem' }}
            onClick={() => setActiveTab('guide')}
          >
            <Sparkles size={13} />
            <span>HR Quick-Start Guide</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'pdf' ? 'btn-dark' : 'btn-secondary'}`}
            style={{ borderRadius: 0, border: 'none', padding: '0.6rem 1rem' }}
            onClick={() => setActiveTab('pdf')}
          >
            <Printer size={13} />
            <span>Printable Form / PDF</span>
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem', maxHeight: '65vh', overflowY: 'auto' }}>
          {/* TAB 1: EXACT COLUMN BLUEPRINT */}
          {activeTab === 'columns' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', backgroundColor: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.825rem', color: 'var(--c-muted)' }}>
                  Use these <strong>exact question titles</strong> when creating your Google Form so responses auto-sync into EvalSheet.
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button className="btn btn-secondary btn-sm" onClick={handleDownloadTemplateCSV}>
                    <Download size={13} />
                    <span>Download CSV Template</span>
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={handleCopyTitles}>
                    {copiedTitles ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedTitles ? 'Copied!' : 'Copy All Question Titles'}</span>
                  </button>
                </div>
              </div>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <table className="corp-table" style={{ fontSize: '0.825rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '38%' }}>Google Form Question Title</th>
                      <th style={{ width: '22%' }}>Question Type</th>
                      <th>Mapped EvalSheet Field</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GOOGLE_FORM_COLUMNS.map((col, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: 'var(--c-primary)' }}>
                          {col.exactTitle}
                          {col.isRequired && <span style={{ color: '#991b1b', marginLeft: '0.2rem' }}>*</span>}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.725rem', padding: '0.15rem 0.4rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', color: 'var(--c-muted)', fontWeight: 600 }}>
                            {col.formType}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.775rem', color: 'var(--c-accent)' }}>
                          {col.evalField}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: HR QUICK-START GUIDE */}
          {activeTab === 'guide' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', backgroundColor: 'var(--bg-app)' }}>
                <div style={{ fontWeight: 700, color: 'var(--c-primary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ backgroundColor: 'var(--c-accent)', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span>
                  Create a new form on Google Forms
                </div>
                <div style={{ color: 'var(--c-muted)', marginLeft: '1.75rem' }}>
                  Go to <a href="https://forms.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--c-accent)', fontWeight: 600 }}>forms.google.com</a> and click on <strong>Blank form</strong>. Title it e.g. <em>"Placement Coordinator Application 2024-25"</em>.
                </div>
              </div>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', backgroundColor: 'var(--bg-app)' }}>
                <div style={{ fontWeight: 700, color: 'var(--c-primary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ backgroundColor: 'var(--c-accent)', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
                  Add the questions using the Exact Column Blueprint
                </div>
                <div style={{ color: 'var(--c-muted)', marginLeft: '1.75rem' }}>
                  Copy each question from the <strong>Exact Column Blueprint</strong> tab. Ensure fields like <em>Full Name</em>, <em>Roll Number</em>, <em>Department</em>, and <em>Division</em> are set to <strong>Required</strong>.
                </div>
              </div>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', backgroundColor: 'var(--bg-app)' }}>
                <div style={{ fontWeight: 700, color: 'var(--c-primary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ backgroundColor: 'var(--c-accent)', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</span>
                  Collect candidate responses
                </div>
                <div style={{ color: 'var(--c-muted)', marginLeft: '1.75rem' }}>
                  Share the Google Form link with students. All submissions are automatically saved in Google Forms.
                </div>
              </div>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', backgroundColor: 'var(--bg-app)' }}>
                <div style={{ fontWeight: 700, color: 'var(--c-primary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ backgroundColor: 'var(--c-accent)', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>4</span>
                  Download CSV & Import into EvalSheet
                </div>
                <div style={{ color: 'var(--c-muted)', marginLeft: '1.75rem' }}>
                  In Google Forms, click <strong>Responses</strong> &rarr; click the <strong>three dots</strong> (&vellip;) &rarr; <strong>Download responses (.csv)</strong>. Then open EvalSheet and click <strong>Import CSV</strong> on the top dashboard.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRINTABLE PDF VIEW */}
          {activeTab === 'pdf' && (
            <div id="printable-sample-form" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.6, backgroundColor: '#ffffff', color: '#0f172a', padding: '1rem' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>
                  Candidate Evaluation & Recruitment Committee
                </div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.25rem 0', color: '#0f172a' }}>
                  Candidate Application & Assessment Form
                </h1>
                <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                  Universal Candidate Questionnaire & Evaluation Profile
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.5rem', color: '#0f172a' }}>
                  Section 1: Candidate Identification
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div style={{ border: '1px solid #cbd5e1', padding: '0.4rem', borderRadius: '4px' }}>Full Name: ____________________</div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '0.4rem', borderRadius: '4px' }}>Roll / ID Number: _____________</div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '0.4rem', borderRadius: '4px' }}>Department / Domain: __________</div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '0.4rem', borderRadius: '4px' }}>Division / Section: ____________</div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '0.4rem', borderRadius: '4px' }}>Current CGPA / Score: _________</div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '0.4rem', borderRadius: '4px' }}>Contact Phone / Email: _________</div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.5rem', color: '#0f172a' }}>
                  Section 2: Qualitative & Situational Assessment
                </h2>
                <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  1. Why are you applying for this role / position?
                  <div style={{ border: '1px solid #cbd5e1', minHeight: '40px', borderRadius: '4px', marginTop: '0.2rem' }}></div>
                </div>
                <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  2. Key strengths & prior relevant experience:
                  <div style={{ border: '1px solid #cbd5e1', minHeight: '40px', borderRadius: '4px', marginTop: '0.2rem' }}></div>
                </div>
                <div style={{ fontSize: '0.8rem' }}>
                  3. Describe a challenging situation you handled under tight deadlines:
                  <div style={{ border: '1px solid #cbd5e1', minHeight: '40px', borderRadius: '4px', marginTop: '0.2rem' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {activeTab === 'pdf' ? (
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={14} />
              <span>Save as PDF / Print</span>
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleDownloadTemplateCSV}>
              <Download size={14} />
              <span>Download Template CSV</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
