import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// ==========================================
// 1. Authentication & Users
// ==========================================
router.post('/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const user = await db.registerUser(name, email, password, role);
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await db.loginUser(email, password);
    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await db.getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. Students & Candidate Directory
// ==========================================
router.get('/students', async (req, res) => {
  try {
    const students = await db.getStudents();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/students/bulk', async (req, res) => {
  const { students } = req.body;
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'students array is required' });
  }

  try {
    const inserted = await db.bulkAddStudents(students);
    res.json({ success: true, count: inserted.length, students: inserted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const handleClearStudents = async (req, res) => {
  const userRole = req.body?.userRole || req.query?.userRole;
  if (userRole !== 'ADMIN' && userRole !== 'HEAD_INTERVIEWER') {
    return res.status(403).json({ error: 'Permission denied. Only Admins can clear all candidates.' });
  }

  try {
    await db.clearAllStudents();
    res.json({ success: true, message: 'All candidate records and evaluations have been removed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.delete('/students', handleClearStudents);
router.post('/students/clear', handleClearStudents);

router.get('/export', async (req, res) => {
  try {
    const data = await db.getExportData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/students/:id', async (req, res) => {
  try {
    const student = await db.getStudentById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/students/:id/evaluation', async (req, res) => {
  try {
    const data = await db.getStudentLatestEvaluation(req.params.id);
    if (!data) return res.status(404).json({ error: 'Evaluation not found for this candidate' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. Interview Mutex & Lifecycle
// ==========================================
router.post('/interviews/start', async (req, res) => {
  const { studentId, userId, userName } = req.body;
  if (!studentId || !userId || !userName) {
    return res.status(400).json({ error: 'Missing required parameters (studentId, userId, userName)' });
  }

  try {
    const result = await db.lockStudent(studentId, userId, userName);
    if (!result.success) {
      if (result.reason === 'ALREADY_LOCKED') {
        return res.status(409).json({
          error: `Candidate is currently locked by ${result.lockedBy}`,
          lockedBy: result.lockedBy
        });
      }
      return res.status(404).json({ error: result.reason });
    }
    res.json({ success: true, interviewId: result.interviewId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/interviews/heartbeat', async (req, res) => {
  const { studentId, userId } = req.body;
  try {
    await db.updateHeartbeat(studentId, userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/interviews/:id', async (req, res) => {
  try {
    const data = await db.getInterviewSession(req.params.id);
    if (!data) return res.status(404).json({ error: 'Interview session not found' });
    
    const student = await db.getStudentById(data.interview.student_id);
    res.json({ ...data, student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/interviews/:id/evaluation', async (req, res) => {
  try {
    const result = await db.saveEvaluation(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/interviews/:id/finish', async (req, res) => {
  const { action, cutReason } = req.body;
  if (!['COMPLETE', 'PAUSE', 'CUT'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action. Must be COMPLETE, PAUSE, or CUT' });
  }

  try {
    const result = await db.finishInterview(req.params.id, action, cutReason);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. Question Bank & Questions Import
// ==========================================
router.get('/questions', async (req, res) => {
  try {
    const questions = await db.getQuestions();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/questions', async (req, res) => {
  const { category, question_text, expected_behavior, follow_up, created_by } = req.body;
  if (!category || !question_text) {
    return res.status(400).json({ error: 'category and question_text are required' });
  }

  try {
    const created = await db.addCustomQuestion(category, question_text, expected_behavior, follow_up, created_by);
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/questions/bulk', async (req, res) => {
  const { questions, created_by } = req.body;
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'questions array is required' });
  }

  try {
    const inserted = await db.bulkAddQuestions(questions, created_by);
    res.json({ success: true, count: inserted.length, questions: inserted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/questions/:id', async (req, res) => {
  try {
    await db.deleteQuestion(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/interviews/:id/questions', async (req, res) => {
  const { questionId, modifiedText, category } = req.body;
  try {
    const saved = await db.saveInterviewQuestion(req.params.id, questionId, modifiedText, category);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
