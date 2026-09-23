import React, { useState } from 'react';
import { Upload, X, Check, AlertCircle, FileSpreadsheet, Download } from 'lucide-react';

// Robust CSV Line & Quote Parser
function parseCSV(text) {
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
        i++; // skip escaped quote
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

export default function ImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const rows = parseCSV(text);
        if (rows.length < 2) {
          setErrorMsg('CSV file must have a header row and at least 1 candidate row.');
          return;
        }

        const rawHeaders = rows[0].map(h => h.replace(/^\uFEFF/, '').trim()); // Strip BOM
        const dataRows = rows.slice(1);

        setHeaders(rawHeaders);

        // Auto-detect columns
        const candidates = dataRows.map((r, rowIdx) => {
          const rowObj = {};
          rawHeaders.forEach((h, hIdx) => {
            rowObj[h] = r[hIdx] || '';
          });

          // Smart Key Mapping
          let roll_no = '';
          let name = '';
          let branch = '';
          let division = '';
          let cgpa = '';
          let email = '';
          let phone = '';
          const form_responses = {};

          rawHeaders.forEach(h => {
            const lower = h.toLowerCase();
            const val = rowObj[h];

            if (lower.includes('roll') || lower.includes('prn') || lower.includes('id')) {
              if (!roll_no) roll_no = val;
            } else if (lower.includes('name')) {
              if (!name) name = val;
            } else if (lower.includes('branch') || lower.includes('department') || lower.includes('dept')) {
              if (!branch) branch = val;
            } else if (lower.includes('div') || lower.includes('section') || lower.includes('class')) {
              if (!division) division = val;
            } else if (lower.includes('cgpa') || lower.includes('gpa') || lower.includes('pointer')) {
              if (!cgpa) cgpa = val;
            } else if (lower.includes('email') || lower.includes('mail')) {
              if (!email) email = val;
            } else if (lower.includes('phone') || lower.includes('mobile') || lower.includes('contact') || lower.includes('whatsapp')) {
              if (!phone) phone = val;
            } else {
              // Store as dynamic Google Form Question response
              form_responses[h] = val;
            }
          });

          return {
            id: 'std-imp-' + Date.now() + '-' + rowIdx,
            roll_no: roll_no || `AUTOROLL-${rowIdx + 1}`,
            name: name || `Candidate ${rowIdx + 1}`,
            branch: branch || 'General',
            division: division || 'Div A',
            cgpa: cgpa || '—',
            email: email || '',
            phone: phone || '',
            form_responses
          };
        });

        setParsedRows(candidates);
      } catch (err) {
        setErrorMsg('Error parsing CSV file: ' + err.message);
      }
    };
    reader.readAsText(selected);
  };

  const handleDownloadSample = () => {
    const sample = `Roll Number,Candidate Name,Department,Division,CGPA,Email Address,Phone Number,Why are you applying for this role?,Key strengths & relevant experience,Availability
2024-ENG-01,Alex Morgan,Computer Science & Engineering,Section A,8.75,alex.m@university.edu,+1 555-234-5678,"Passionate about building scalable systems and cross-functional leadership.","Led 5-member team in regional hackathon; published 1 research paper.","100% available and flexible for all interview slots."
2024-ENG-02,Jordan Lee,Information Systems,Section B,9.20,jordan.l@university.edu,+1 555-876-5432,"Excited to contribute to product and operational excellence.","Class representative for 2 terms; organized tech symposium.","Available across all required shifts."`;

    const blob = new Blob(['\uFEFF' + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_candidate_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    try {
      await onImportSuccess(parsedRows);
      onClose();
    } catch (err) {
      setErrorMsg('Failed to import: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSpreadsheet size={18} color="var(--c-accent)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--c-primary)' }}>
              Bulk Import Candidates (CSV / Google Form Responses)
            </h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body">
          {/* Instructions Strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.825rem', color: 'var(--c-muted)' }}>
              Upload your candidate spreadsheet or Google Form responses CSV. Columns will be auto-detected.
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleDownloadSample}>
              <Download size={13} />
              <span>Sample CSV</span>
            </button>
          </div>

          {/* File Upload Box */}
          <div style={{ 
            border: '2px dashed var(--border-color)', 
            borderRadius: 'var(--radius-md)', 
            padding: '2rem 1.5rem', 
            textAlign: 'center',
            backgroundColor: 'var(--bg-app)',
            marginBottom: '1.25rem',
            cursor: 'pointer'
          }}>
            <input 
              type="file" 
              accept=".csv,text/csv" 
              onChange={handleFileChange}
              id="csv-file-input"
              style={{ display: 'none' }}
            />
            <label htmlFor="csv-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={28} color="var(--c-accent)" />
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--c-primary)' }}>
                {file ? file.name : 'Click to browse or drop CSV spreadsheet here'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--c-muted)' }}>
                Supports standard Google Forms export (.csv) or custom spreadsheets
              </div>
            </label>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-muted)' }}>
                  Detected Candidates ({parsedRows.length} rows ready to import)
                </span>
              </div>
              <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <table className="corp-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Candidate Name</th>
                      <th>Branch</th>
                      <th>CGPA</th>
                      <th>Form Fields</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 10).map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.roll_no}</td>
                        <td style={{ fontWeight: 600 }}>{row.name}</td>
                        <td>{row.branch}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{row.cgpa}</td>
                        <td style={{ color: 'var(--c-muted)', fontSize: '0.75rem' }}>
                          {Object.keys(row.form_responses).length} questions mapped
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 10 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--c-muted)', marginTop: '0.35rem', textAlign: 'right' }}>
                  + {parsedRows.length - 10} more rows
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isProcessing}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleConfirmImport} 
            disabled={parsedRows.length === 0 || isProcessing}
          >
            <Check size={14} />
            <span>{isProcessing ? 'Importing...' : `Import ${parsedRows.length} Candidates`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
