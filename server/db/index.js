import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool = null;
let usePostgres = false;

// Simple, fast, secure hash using Node.js crypto
export function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'evalsheet_salt_2024').digest('hex');
}

// In-memory persistent state (starts 100% clean / blank)
let memoryStore = {
  users: [],
  students: [],
  questions: [],
  interviews: [],
  evaluations: [],
  interview_questions: []
};

export async function initDB() {
  let dbUrl = process.env.DATABASE_URL?.trim();

  if (dbUrl) {
    // Strip channel_binding if present (node-postgres pg driver compatibility)
    let cleanUrl = dbUrl.replace(/([?&])channel_binding=[^&]*(&|$)/g, (match, p1, p2) => (p2 ? p1 : ''));
    if (cleanUrl.endsWith('?') || cleanUrl.endsWith('&')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }

    try {
      console.log('⏳ Connecting to PostgreSQL database...');
      pool = new pg.Pool({
        connectionString: cleanUrl,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000
      });

      const client = await pool.connect();
      const testRes = await client.query('SELECT NOW() as db_time');
      console.log('✅ Connected to 24/7 Cloud PostgreSQL (Neon). Server Time:', testRes.rows[0].db_time);
      
      // Run schema initialization
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSQL);

      // Ensure roll_no unique constraint is dropped if existing from older schema
      await client.query(`
        DO $$ 
        BEGIN 
          IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_roll_no_key') THEN 
            ALTER TABLE students DROP CONSTRAINT students_roll_no_key; 
          END IF; 
        END $$;
      `);

      console.log('✅ PostgreSQL Schema initialized successfully.');

      client.release();
      usePostgres = true;

    } catch (err) {
      console.error('❌ PostgreSQL connection error:', err.message);
      console.warn('⚠️ Switching to local fallback in-memory state engine.');
      usePostgres = false;
    }
  } else {
    console.log('ℹ️ No DATABASE_URL provided. Running on local state engine.');
  }
}


export const db = {
  isPostgres: () => usePostgres,
  
  async query(text, params) {
    if (usePostgres && pool) {
      return pool.query(text, params);
    }
    throw new Error('Postgres query called in fallback mode');
  },

  // 1. Authentication & Users
  async registerUser(name, email, password, requestedRole = 'INTERVIEWER') {
    const normalizedEmail = email.trim().toLowerCase();
    const password_hash = hashPassword(password);
    const id = 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    if (usePostgres) {
      // Check if first user ever (make them ADMIN)
      const countRes = await pool.query('SELECT count(*) FROM users');
      const isFirstUser = parseInt(countRes.rows[0].count, 10) === 0;
      const role = isFirstUser ? 'ADMIN' : (requestedRole || 'INTERVIEWER');

      const existing = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
      if (existing.rows.length > 0) {
        throw new Error('An account with this email address already exists.');
      }

      const res = await pool.query(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, created_at',
        [id, name.trim(), normalizedEmail, password_hash, role]
      );
      return res.rows[0];
    } else {
      const isFirstUser = memoryStore.users.length === 0;
      const role = isFirstUser ? 'ADMIN' : (requestedRole || 'INTERVIEWER');

      const existing = memoryStore.users.find(u => u.email.toLowerCase() === normalizedEmail);
      if (existing) {
        throw new Error('An account with this email address already exists.');
      }

      const newUser = {
        id,
        name: name.trim(),
        email: normalizedEmail,
        password_hash,
        role,
        created_at: new Date().toISOString()
      };
      memoryStore.users.push(newUser);
      return { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, created_at: newUser.created_at };
    }
  },

  async loginUser(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const password_hash = hashPassword(password);

    if (usePostgres) {
      const res = await pool.query(
        'SELECT id, name, email, role, created_at FROM users WHERE email = $1 AND password_hash = $2',
        [normalizedEmail, password_hash]
      );
      if (res.rows.length === 0) {
        throw new Error('Invalid email address or password.');
      }
      return res.rows[0];
    } else {
      const user = memoryStore.users.find(u => u.email.toLowerCase() === normalizedEmail && u.password_hash === password_hash);
      if (!user) {
        throw new Error('Invalid email address or password.');
      }
      return { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at };
    }
  },

  async getUsers() {
    if (usePostgres) {
      const res = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY name ASC');
      return res.rows;
    }
    return memoryStore.users.map(({ password_hash, ...rest }) => rest);
  },

  // 2. Candidate Students
  async getStudents() {
    const now = Date.now();
    if (usePostgres) {
      // Auto-unlock orphaned locks (> 5 minutes)
      await pool.query(`
        UPDATE students
        SET current_status = 'READY', locked_by_user_id = NULL, locked_by_user_name = NULL, lock_heartbeat = NULL
        WHERE current_status = 'IN_PROGRESS' 
        AND lock_heartbeat IS NOT NULL 
        AND lock_heartbeat < NOW() - INTERVAL '5 minutes'
      `);
      const res = await pool.query('SELECT * FROM students ORDER BY created_at ASC');
      return res.rows.map(r => ({
        ...r,
        form_responses: typeof r.form_responses === 'string' ? JSON.parse(r.form_responses) : r.form_responses
      }));
    } else {
      memoryStore.students = memoryStore.students.map(s => {
        if (s.current_status === 'IN_PROGRESS' && s.lock_heartbeat && (now - new Date(s.lock_heartbeat).getTime() > 300000)) {
          return { ...s, current_status: 'READY', locked_by_user_id: null, locked_by_user_name: null, lock_heartbeat: null };
        }
        return s;
      });
      return [...memoryStore.students].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    }
  },


  async getStudentById(id) {
    if (usePostgres) {
      const res = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      const s = res.rows[0];
      return {
        ...s,
        form_responses: typeof s.form_responses === 'string' ? JSON.parse(s.form_responses) : s.form_responses
      };
    }
    return memoryStore.students.find(s => s.id === id) || null;
  },

  async bulkAddStudents(studentsList) {
    const inserted = [];
    if (usePostgres) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (let i = 0; i < studentsList.length; i++) {
          const s = studentsList[i];
          const id = s.id || ('std-' + Date.now() + '-' + i + '-' + Math.random().toString(36).substring(2, 6));
          const formResponses = JSON.stringify(s.form_responses || {});
          const res = await client.query(`
            INSERT INTO students (id, roll_no, name, email, phone, branch, division, cgpa, form_responses, current_status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'READY', NOW() + ($10 * INTERVAL '1 millisecond'))
            RETURNING *
          `, [id, s.roll_no || 'N/A', s.name || 'Candidate', s.email || '', s.phone || '', s.branch || '', s.division || '', s.cgpa || '', formResponses, i]);
          inserted.push(res.rows[0]);
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      for (let i = 0; i < studentsList.length; i++) {
        const s = studentsList[i];
        const id = s.id || ('std-' + Date.now() + '-' + i + '-' + Math.random().toString(36).substring(2, 6));
        const newRecord = {
          id,
          roll_no: s.roll_no || 'N/A',
          name: s.name || 'Candidate',
          email: s.email || '',
          phone: s.phone || '',
          branch: s.branch || '',
          division: s.division || '',
          cgpa: s.cgpa || '',
          form_responses: s.form_responses || {},
          current_status: 'READY',
          locked_by_user_id: null,
          locked_by_user_name: null,
          lock_heartbeat: null,
          created_at: new Date(Date.now() + i).toISOString()
        };
        memoryStore.students.push(newRecord);
        inserted.push(newRecord);
      }
    }
    return inserted;
  },



  async clearAllStudents() {
    if (usePostgres) {
      await pool.query('TRUNCATE TABLE students CASCADE');
    } else {
      memoryStore.students = [];
      memoryStore.interviews = [];
      memoryStore.evaluations = [];
      memoryStore.interview_questions = [];
    }
    return { success: true };
  },

  async lockStudent(studentId, userId, userName) {
    const now = new Date();
    if (usePostgres) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const check = await client.query('SELECT * FROM students WHERE id = $1 FOR UPDATE', [studentId]);
        if (check.rows.length === 0) {
          await client.query('ROLLBACK');
          return { success: false, reason: 'STUDENT_NOT_FOUND' };
        }
        const student = check.rows[0];
        
        if (student.current_status === 'IN_PROGRESS' && student.locked_by_user_id && student.locked_by_user_id !== userId) {
          const hb = student.lock_heartbeat ? new Date(student.lock_heartbeat).getTime() : 0;
          if (Date.now() - hb < 300000) {
            await client.query('ROLLBACK');
            return { success: false, reason: 'ALREADY_LOCKED', lockedBy: student.locked_by_user_name };
          }
        }

        await client.query(`
          UPDATE students 
          SET current_status = 'IN_PROGRESS', locked_by_user_id = $1, locked_by_user_name = $2, lock_heartbeat = $3 
          WHERE id = $4
        `, [userId, userName, now, studentId]);

        let interviewRes = await client.query(`
          SELECT * FROM interviews 
          WHERE student_id = $1 AND interviewer_id = $2 AND status = 'IN_PROGRESS'
          ORDER BY started_at DESC LIMIT 1
        `, [studentId, userId]);

        let interviewId;
        if (interviewRes.rows.length > 0) {
          interviewId = interviewRes.rows[0].id;
        } else {
          interviewId = 'intv-' + Date.now();
          await client.query(`
            INSERT INTO interviews (id, student_id, interviewer_id, status, started_at)
            VALUES ($1, $2, $3, 'IN_PROGRESS', $4)
          `, [interviewId, studentId, userId, now]);

          await client.query(`
            INSERT INTO evaluations (id, interview_id, communication, coordination, problem_solving, professionalism, hr_communication, total_score, notes)
            VALUES ($1, $2, 0, 0, 0, 0, 0, 0.00, '')
            ON CONFLICT (interview_id) DO NOTHING
          `, ['eval-' + Date.now(), interviewId]);
        }

        await client.query('COMMIT');
        return { success: true, interviewId };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      const student = memoryStore.students.find(s => s.id === studentId);
      if (!student) return { success: false, reason: 'STUDENT_NOT_FOUND' };
      
      if (student.current_status === 'IN_PROGRESS' && student.locked_by_user_id && student.locked_by_user_id !== userId) {
        const hb = student.lock_heartbeat ? new Date(student.lock_heartbeat).getTime() : 0;
        if (Date.now() - hb < 300000) {
          return { success: false, reason: 'ALREADY_LOCKED', lockedBy: student.locked_by_user_name };
        }
      }

      student.current_status = 'IN_PROGRESS';
      student.locked_by_user_id = userId;
      student.locked_by_user_name = userName;
      student.lock_heartbeat = now.toISOString();

      let interview = memoryStore.interviews.find(i => i.student_id === studentId && i.interviewer_id === userId && i.status === 'IN_PROGRESS');
      if (!interview) {
        interview = {
          id: 'intv-' + Date.now(),
          student_id: studentId,
          interviewer_id: userId,
          status: 'IN_PROGRESS',
          started_at: now.toISOString()
        };
        memoryStore.interviews.push(interview);

        memoryStore.evaluations.push({
          id: 'eval-' + Date.now(),
          interview_id: interview.id,
          communication: 0,
          coordination: 0,
          problem_solving: 0,
          professionalism: 0,
          hr_communication: 0,
          total_score: 0.00,
          notes: ''
        });
      }

      return { success: true, interviewId: interview.id };
    }
  },

  async updateHeartbeat(studentId, userId) {
    const now = new Date();
    if (usePostgres) {
      await pool.query(`
        UPDATE students SET lock_heartbeat = $1 WHERE id = $2 AND locked_by_user_id = $3
      `, [now, studentId, userId]);
    } else {
      const s = memoryStore.students.find(x => x.id === studentId && x.locked_by_user_id === userId);
      if (s) s.lock_heartbeat = now.toISOString();
    }
  },

  async getInterviewSession(interviewId) {
    if (usePostgres) {
      const intvRes = await pool.query('SELECT * FROM interviews WHERE id = $1', [interviewId]);
      if (intvRes.rows.length === 0) return null;
      const interview = intvRes.rows[0];

      const evalRes = await pool.query('SELECT * FROM evaluations WHERE interview_id = $1', [interviewId]);
      const evaluation = evalRes.rows[0] || null;

      const qRes = await pool.query('SELECT * FROM interview_questions WHERE interview_id = $1 ORDER BY order_index ASC', [interviewId]);

      return { interview, evaluation, questions: qRes.rows };
    } else {
      const interview = memoryStore.interviews.find(i => i.id === interviewId);
      if (!interview) return null;
      const evaluation = memoryStore.evaluations.find(e => e.interview_id === interviewId) || null;
      const questions = memoryStore.interview_questions.filter(q => q.interview_id === interviewId);
      return { interview, evaluation, questions };
    }
  },

  async saveEvaluation(interviewId, evalData) {
    const { communication, coordination, problem_solving, professionalism, hr_communication, notes } = evalData;
    const scores = [communication, coordination, problem_solving, professionalism, hr_communication].map(n => Number(n) || 0);
    const nonZero = scores.filter(s => s > 0);
    const total_score = nonZero.length > 0 ? (scores.reduce((a, b) => a + b, 0) / nonZero.length).toFixed(2) : 0.00;

    if (usePostgres) {
      await pool.query(`
        INSERT INTO evaluations (id, interview_id, communication, coordination, problem_solving, professionalism, hr_communication, total_score, notes, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (interview_id) DO UPDATE SET
          communication = EXCLUDED.communication,
          coordination = EXCLUDED.coordination,
          problem_solving = EXCLUDED.problem_solving,
          professionalism = EXCLUDED.professionalism,
          hr_communication = EXCLUDED.hr_communication,
          total_score = EXCLUDED.total_score,
          notes = EXCLUDED.notes,
          updated_at = NOW()
      `, [
        'eval-' + Date.now(),
        interviewId,
        communication,
        coordination,
        problem_solving,
        professionalism,
        hr_communication,
        total_score,
        notes
      ]);
    } else {
      let ev = memoryStore.evaluations.find(e => e.interview_id === interviewId);
      if (!ev) {
        ev = { id: 'eval-' + Date.now(), interview_id: interviewId };
        memoryStore.evaluations.push(ev);
      }
      ev.communication = communication;
      ev.coordination = coordination;
      ev.problem_solving = problem_solving;
      ev.professionalism = professionalism;
      ev.hr_communication = hr_communication;
      ev.total_score = total_score;
      ev.notes = notes;
      ev.updated_at = new Date().toISOString();
    }
    return { success: true, total_score };
  },

  async finishInterview(interviewId, action, cutReason = null) {
    const now = new Date();
    let status = 'COMPLETED';
    let studentStatus = 'COMPLETED';

    if (action === 'PAUSE') {
      status = 'PAUSED';
      studentStatus = 'PAUSED';
    } else if (action === 'CUT') {
      status = 'CUT';
      studentStatus = 'CUT';
    }

    if (usePostgres) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const intvRes = await client.query('SELECT * FROM interviews WHERE id = $1', [interviewId]);
        if (intvRes.rows.length === 0) {
          await client.query('ROLLBACK');
          return { success: false };
        }
        const studentId = intvRes.rows[0].student_id;

        await client.query(`
          UPDATE interviews 
          SET status = $1, cut_reason = $2, ended_at = $3
          WHERE id = $4
        `, [status, cutReason, (action === 'PAUSE' ? null : now), interviewId]);

        await client.query(`
          UPDATE students
          SET current_status = $1, 
              locked_by_user_id = ${action === 'PAUSE' ? 'locked_by_user_id' : 'NULL'}, 
              locked_by_user_name = ${action === 'PAUSE' ? 'locked_by_user_name' : 'NULL'}, 
              lock_heartbeat = ${action === 'PAUSE' ? 'NOW()' : 'NULL'}
          WHERE id = $2
        `, [studentStatus, studentId]);

        await client.query('COMMIT');
        return { success: true, status };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      const interview = memoryStore.interviews.find(i => i.id === interviewId);
      if (!interview) return { success: false };
      interview.status = status;
      interview.cut_reason = cutReason;
      if (action !== 'PAUSE') interview.ended_at = now.toISOString();

      const student = memoryStore.students.find(s => s.id === interview.student_id);
      if (student) {
        student.current_status = studentStatus;
        if (action !== 'PAUSE') {
          student.locked_by_user_id = null;
          student.locked_by_user_name = null;
          student.lock_heartbeat = null;
        }
      }
      return { success: true, status };
    }
  },

  async getStudentLatestEvaluation(studentId) {
    if (usePostgres) {
      const intvRes = await pool.query(`
        SELECT i.*, u.name as interviewer_name, u.email as interviewer_email
        FROM interviews i
        LEFT JOIN users u ON i.interviewer_id = u.id
        WHERE i.student_id = $1
        ORDER BY i.started_at DESC LIMIT 1
      `, [studentId]);
      if (intvRes.rows.length === 0) return null;
      const interview = intvRes.rows[0];

      const evalRes = await pool.query('SELECT * FROM evaluations WHERE interview_id = $1', [interview.id]);
      const evaluation = evalRes.rows[0] || null;

      const qRes = await pool.query('SELECT * FROM interview_questions WHERE interview_id = $1 ORDER BY order_index ASC', [interview.id]);
      const studentRes = await pool.query('SELECT * FROM students WHERE id = $1', [studentId]);

      return { interview, evaluation, questions: qRes.rows, student: studentRes.rows[0] || null };
    } else {
      const interviews = memoryStore.interviews
        .filter(i => i.student_id === studentId)
        .sort((a, b) => new Date(b.started_at) - new Date(a.started_at));

      if (interviews.length === 0) return null;
      const interview = interviews[0];
      const interviewer = memoryStore.users.find(u => u.id === interview.interviewer_id);
      interview.interviewer_name = interviewer ? interviewer.name : 'Coordinator';
      interview.interviewer_email = interviewer ? interviewer.email : '';

      const evaluation = memoryStore.evaluations.find(e => e.interview_id === interview.id) || null;
      const questions = memoryStore.interview_questions.filter(q => q.interview_id === interview.id);
      const student = memoryStore.students.find(s => s.id === studentId) || null;

      return { interview, evaluation, questions, student };
    }
  },

  async getExportData() {
    const students = await this.getStudents();
    const exportRows = [];

    for (const s of students) {
      const evalData = await this.getStudentLatestEvaluation(s.id);
      const row = {
        roll_no: s.roll_no,
        name: s.name,
        branch: s.branch,
        division: s.division,
        cgpa: s.cgpa,
        email: s.email,
        phone: s.phone,
        status: s.current_status,
        interviewer: evalData?.interview?.interviewer_name || s.locked_by_user_name || 'N/A',
        communication: evalData?.evaluation?.communication || 0,
        coordination: evalData?.evaluation?.coordination || 0,
        problem_solving: evalData?.evaluation?.problem_solving || 0,
        professionalism: evalData?.evaluation?.professionalism || 0,
        hr_communication: evalData?.evaluation?.hr_communication || 0,
        total_score: evalData?.evaluation?.total_score || '0.00',
        notes: evalData?.evaluation?.notes || '',
        cut_reason: evalData?.interview?.cut_reason || '',
        form_responses: s.form_responses || {}
      };
      exportRows.push(row);
    }
    return exportRows;
  },

  // 3. Question Bank Management
  async getQuestions() {
    if (usePostgres) {
      const res = await pool.query('SELECT * FROM questions ORDER BY category ASC, created_at ASC');
      return res.rows;
    }
    return memoryStore.questions;
  },

  async addCustomQuestion(category, question_text, expected_behavior = '', follow_up = '', created_by = null) {
    const newQ = {
      id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      category: category.trim(),
      question_text: question_text.trim(),
      expected_behavior: (expected_behavior || '').trim(),
      follow_up: (follow_up || '').trim(),
      created_by
    };
    if (usePostgres) {
      await pool.query(`
        INSERT INTO questions (id, category, question_text, expected_behavior, follow_up, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [newQ.id, newQ.category, newQ.question_text, newQ.expected_behavior, newQ.follow_up, newQ.created_by]);
    } else {
      memoryStore.questions.push(newQ);
    }
    return newQ;
  },

  async bulkAddQuestions(questionsList, created_by = null) {
    const inserted = [];
    if (usePostgres) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const q of questionsList) {
          const id = 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
          const res = await client.query(`
            INSERT INTO questions (id, category, question_text, expected_behavior, follow_up, created_by)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
          `, [id, (q.category || 'General').trim(), q.question_text.trim(), (q.expected_behavior || '').trim(), (q.follow_up || '').trim(), created_by]);
          inserted.push(res.rows[0]);
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      for (const q of questionsList) {
        const item = {
          id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          category: (q.category || 'General').trim(),
          question_text: q.question_text.trim(),
          expected_behavior: (q.expected_behavior || '').trim(),
          follow_up: (q.follow_up || '').trim(),
          created_by,
          created_at: new Date().toISOString()
        };
        memoryStore.questions.push(item);
        inserted.push(item);
      }
    }
    return inserted;
  },

  async deleteQuestion(id) {
    if (usePostgres) {
      await pool.query('DELETE FROM questions WHERE id = $1', [id]);
    } else {
      memoryStore.questions = memoryStore.questions.filter(q => q.id !== id);
    }
    return { success: true };
  },

  async saveInterviewQuestion(interviewId, questionId, modifiedText, category) {
    const item = {
      id: 'iq-' + Date.now(),
      interview_id: interviewId,
      question_id: questionId,
      modified_text: modifiedText,
      category: category || 'General',
      order_index: Date.now()
    };
    if (usePostgres) {
      await pool.query(`
        INSERT INTO interview_questions (id, interview_id, question_id, modified_text, category, order_index)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [item.id, item.interview_id, item.question_id, item.modified_text, item.category, item.order_index]);
    } else {
      memoryStore.interview_questions.push(item);
    }
    return item;
  }
};
