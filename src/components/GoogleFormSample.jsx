import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Download, FileSpreadsheet, Send, Sparkles } from 'lucide-react';

const FORM_TEMPLATE = {
  title: "Placement Coordinator Application Form 2024-25",
  description: "Official recruitment application for Student Placement & Training Coordinators. Please fill in all fields accurately.",
  sections: [
    {
      title: "Section 1: Academic & Contact Profile",
      description: "Basic candidate identification details",
      fields: [
        { label: "Full Name", type: "Short Text", required: true, example: "Rahul Patil" },
        { label: "College Roll Number / PRN", type: "Short Text", required: true, example: "23CO01" },
        { label: "Department / Branch", type: "Dropdown", required: true, options: ["Computer Engineering", "Information Technology", "Electronics & Telecommunication", "Mechanical Engineering", "Civil Engineering"] },
        { label: "Division & Shift", type: "Short Text", required: true, example: "Div A (Morning Shift)" },
        { label: "Current Aggregate CGPA", type: "Number", required: true, example: "8.92" },
        { label: "Official College Email Address", type: "Email", required: true, example: "rahul.patil23@college.edu" },
        { label: "WhatsApp Contact Number", type: "Phone", required: true, example: "+91 98201 44521" }
      ]
    },
    {
      title: "Section 2: Motivation & Leadership Background",
      description: "Understanding your intent and prior leadership experience",
      fields: [
        { 
          label: "Why do you want to become a placement coordinator?", 
          type: "Paragraph", 
          required: true, 
          hint: "Explain what motivates you to work with visiting corporate recruiters and student batches." 
        },
        { 
          label: "Previous leadership / coordination experience", 
          type: "Paragraph", 
          required: true, 
          hint: "Mention committee roles, hackathon organization, sponsorship management, or student chapter work." 
        },
        { 
          label: "Key Strengths & Areas for Improvement", 
          type: "Paragraph", 
          required: true, 
          hint: "Highlight 2 major operational strengths and 1 area you are actively working to improve." 
        }
      ]
    },
    {
      title: "Section 3: Situational Aptitude & Crisis Management",
      description: "Real-world placement day scenarios",
      fields: [
        { 
          label: "A recruiter tells you that several students are not following instructions or dress code. How do you respond?", 
          type: "Paragraph", 
          required: true, 
          hint: "Walk through your step-by-step de-escalation and corrective action strategy." 
        },
        { 
          label: "How would you handle a situation where two visiting companies clash on interview slots for the same candidates?", 
          type: "Paragraph", 
          required: true, 
          hint: "Demonstrate transparency, scheduling agility, and stakeholder communication." 
        }
      ]
    },
    {
      title: "Section 4: Availability & Commitment",
      description: "Availability declaration during peak hiring seasons",
      fields: [
        { 
          label: "Availability during peak placement season (Aug - Dec)", 
          type: "Multiple Choice", 
          required: true, 
          options: [
            "100% Available (Early mornings from 7 AM & late evening debriefs)",
            "Available with minor academic timetable constraints",
            "Limited availability"
          ] 
        },
        { 
          label: "Declaration of Confidentiality & Code of Conduct", 
          type: "Checkbox", 
          required: true, 
          options: ["I agree to uphold strict confidentiality regarding company shortlists, questions, and offer letters."] 
        }
      ]
    }
  ]
};

export default function GoogleFormSample() {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const sampleFormUrl = `${window.location.origin}/forms/placement-coordinator-2024`;

  const handleCopyText = () => {
    let output = `# ${FORM_TEMPLATE.title}\n${FORM_TEMPLATE.description}\n\n`;
    FORM_TEMPLATE.sections.forEach((sec, idx) => {
      output += `## ${sec.title}\n${sec.description}\n\n`;
      sec.fields.forEach((f, fIdx) => {
        output += `${fIdx + 1}. [${f.required ? 'REQUIRED' : 'OPTIONAL'}] ${f.label} (${f.type})\n`;
        if (f.hint) output += `   Hint: ${f.hint}\n`;
        if (f.options) output += `   Options: ${f.options.join(', ')}\n`;
        output += `\n`;
      });
    });

    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sampleFormUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: '960px' }}>
      {/* Top Banner */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--c-accent)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            <FileSpreadsheet size={15} />
            <span>Google Form Input Template</span>
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--c-primary)' }}>
            Placement Coordinator Application Form
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--c-muted)', marginTop: '0.2rem' }}>
            This standard template feeds applicant responses directly into the multi-interviewer EvalSheet portal.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleCopyLink}>
            {copiedLink ? <Check size={14} color="#166534" /> : <ExternalLink size={14} />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Form Link'}</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleCopyText}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Template Copied!' : 'Copy Form Questions'}</span>
          </button>
        </div>
      </div>

      {/* Shareable Link Box */}
      <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
          <span style={{ fontWeight: 600, color: 'var(--c-primary)', flexShrink: 0 }}>Share URL:</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {sampleFormUrl}
          </span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleCopyLink}>
          <Copy size={12} />
          <span>Copy</span>
        </button>
      </div>

      {/* Form Preview Sections */}
      {FORM_TEMPLATE.sections.map((section, sIdx) => (
        <div key={sIdx} className="info-section" style={{ marginBottom: '1.25rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-primary)' }}>
              {section.title}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--c-muted)', marginTop: '0.15rem' }}>
              {section.description}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {section.fields.map((field, fIdx) => (
              <div key={fIdx} style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--c-primary)' }}>
                    {field.label} {field.required && <span style={{ color: '#991b1b' }}>*</span>}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--c-muted)', backgroundColor: 'var(--bg-surface)', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    {field.type}
                  </span>
                </div>

                {field.hint && (
                  <div style={{ fontSize: '0.775rem', color: 'var(--c-muted)', marginBottom: '0.4rem' }}>
                    {field.hint}
                  </div>
                )}

                {field.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--c-primary)' }}>
                    {field.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: field.type === 'Checkbox' ? '2px' : '50%', border: '1px solid var(--border-subtle)', display: 'inline-block' }}></span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {field.example && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--c-subtle-text)', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                    Sample Response: "{field.example}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
