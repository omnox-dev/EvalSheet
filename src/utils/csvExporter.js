// Utility to generate and trigger Excel-compatible CSV download with UTF-8 BOM

function escapeCSV(field) {
  if (field === null || field === undefined) return '""';
  const str = String(field);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export function exportEvaluationsToCSV(dataList) {
  if (!dataList || dataList.length === 0) {
    alert('No candidate data available to export.');
    return;
  }

  // Collect all unique Google Form question keys across all candidates
  const allQuestionKeys = new Set();
  dataList.forEach(item => {
    if (item.form_responses) {
      Object.keys(item.form_responses).forEach(k => allQuestionKeys.add(k));
    }
  });
  const dynamicQuestions = Array.from(allQuestionKeys);

  // Standard Header Columns
  const headers = [
    'Roll Number',
    'Candidate Name',
    'Branch / Department',
    'Division',
    'CGPA',
    'Email Address',
    'Phone Number',
    'Interview Status',
    'Assigned / Conducted Interviewer',
    'Communication Score (1-5)',
    'Coordination Score (1-5)',
    'Problem Solving Score (1-5)',
    'Professionalism Score (1-5)',
    'HR Rapport Score (1-5)',
    'Overall Evaluation Score (Avg / 5.0)',
    'Qualitative Notes & Observations',
    'Cut / Termination Reason',
    ...dynamicQuestions.map(q => `Google Form: ${q}`)
  ];

  const rows = [headers.map(escapeCSV).join(',')];

  dataList.forEach(item => {
    const row = [
      escapeCSV(item.roll_no),
      escapeCSV(item.name),
      escapeCSV(item.branch),
      escapeCSV(item.division),
      escapeCSV(item.cgpa),
      escapeCSV(item.email),
      escapeCSV(item.phone),
      escapeCSV(item.status),
      escapeCSV(item.interviewer),
      escapeCSV(item.communication || ''),
      escapeCSV(item.coordination || ''),
      escapeCSV(item.problem_solving || ''),
      escapeCSV(item.professionalism || ''),
      escapeCSV(item.hr_communication || ''),
      escapeCSV(item.total_score || ''),
      escapeCSV(item.notes || ''),
      escapeCSV(item.cut_reason || ''),
      ...dynamicQuestions.map(q => escapeCSV(item.form_responses ? item.form_responses[q] || '' : ''))
    ];
    rows.push(row.join(','));
  });

  // Prepend UTF-8 BOM so Excel opens special characters and formatted strings perfectly
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `evalsheet_interview_results_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
