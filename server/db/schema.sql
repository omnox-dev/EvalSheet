-- Universal EvalSheet Relational Schema for PostgreSQL

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'INTERVIEWER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY,
    roll_no VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(50),
    branch VARCHAR(100),
    division VARCHAR(50),
    cgpa VARCHAR(50),
    form_responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    current_status VARCHAR(50) DEFAULT 'READY',
    locked_by_user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    locked_by_user_name VARCHAR(100),
    lock_heartbeat TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS interviews (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    interviewer_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    cut_reason VARCHAR(150),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS evaluations (
    id VARCHAR(50) PRIMARY KEY,
    interview_id VARCHAR(50) UNIQUE NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    communication INT DEFAULT 0,
    coordination INT DEFAULT 0,
    problem_solving INT DEFAULT 0,
    professionalism INT DEFAULT 0,
    hr_communication INT DEFAULT 0,
    total_score NUMERIC(4,2) DEFAULT 0.00,
    notes TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(50) PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    expected_behavior TEXT DEFAULT '',
    follow_up TEXT DEFAULT '',
    created_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interview_questions (
    id VARCHAR(50) PRIMARY KEY,
    interview_id VARCHAR(50) NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    question_id VARCHAR(50) REFERENCES questions(id) ON DELETE SET NULL,
    modified_text TEXT NOT NULL,
    category VARCHAR(100),
    order_index BIGINT DEFAULT 0,
    interviewer_notes TEXT DEFAULT ''
);
