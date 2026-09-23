const API_BASE = '/api';

export const api = {
  // Authentication
  async register(name, email, password, role = 'INTERVIEWER') {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data.user;
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid email or password');
    return data.user;
  },

  async getUsers() {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  // Students
  async getStudents() {
    const res = await fetch(`${API_BASE}/students`);
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  async getStudent(id) {
    const res = await fetch(`${API_BASE}/students/${id}`);
    if (!res.ok) throw new Error('Failed to fetch student details');
    return res.json();
  },

  async bulkImportStudents(students) {
    const res = await fetch(`${API_BASE}/students/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students })
    });
    if (!res.ok) throw new Error('Failed to import students');
    return res.json();
  },

  async clearAllStudents(userRole) {
    const res = await fetch(`${API_BASE}/students/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userRole })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to clear candidates');
    return data;
  },

  async getExportData() {
    const res = await fetch(`${API_BASE}/export`);
    if (!res.ok) throw new Error('Failed to fetch export data');
    return res.json();
  },

  async getStudentEvaluation(studentId) {
    const res = await fetch(`${API_BASE}/students/${studentId}/evaluation`);
    if (!res.ok) throw new Error('Failed to fetch candidate scorecard');
    return res.json();
  },

  // Interviews
  async startInterview(studentId, userId, userName) {
    const res = await fetch(`${API_BASE}/interviews/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, userId, userName })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to start interview');
    }
    return data;
  },

  async sendHeartbeat(studentId, userId) {
    const res = await fetch(`${API_BASE}/interviews/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, userId })
    });
    return res.json();
  },

  async getInterviewSession(interviewId) {
    const res = await fetch(`${API_BASE}/interviews/${interviewId}`);
    if (!res.ok) throw new Error('Failed to load interview session');
    return res.json();
  },

  async saveEvaluation(interviewId, evalData) {
    const res = await fetch(`${API_BASE}/interviews/${interviewId}/evaluation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evalData)
    });
    if (!res.ok) throw new Error('Failed to save evaluation');
    return res.json();
  },

  async finishInterview(interviewId, action, cutReason = null) {
    const res = await fetch(`${API_BASE}/interviews/${interviewId}/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, cutReason })
    });
    if (!res.ok) throw new Error('Failed to finish interview');
    return res.json();
  },

  // Question Bank
  async getQuestions() {
    const res = await fetch(`${API_BASE}/questions`);
    if (!res.ok) throw new Error('Failed to fetch questions');
    return res.json();
  },

  async addCustomQuestion(data) {
    const res = await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add custom question');
    return res.json();
  },

  async bulkImportQuestions(questions, created_by) {
    const res = await fetch(`${API_BASE}/questions/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions, created_by })
    });
    if (!res.ok) throw new Error('Failed to import questions');
    return res.json();
  },

  async deleteQuestion(id) {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete question');
    return res.json();
  },

  async recordInterviewQuestion(interviewId, questionId, modifiedText, category) {
    const res = await fetch(`${API_BASE}/interviews/${interviewId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, modifiedText, category })
    });
    return res.json();
  }
};
