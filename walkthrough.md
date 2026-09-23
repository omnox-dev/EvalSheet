# Walkthrough: Professional Corporate Interview System (EvalSheet)

A distraction-free, professional corporate interview management system designed with a strict **two-color minimalist palette** (Slate Charcoal `#0F172A` + Precision Cobalt `#2563EB`) and backed by a **PostgreSQL relational database architecture** for 24/7 multi-interviewer concurrency.

---

## What Was Accomplished

### 1. Relational Database Layer & 24/7 Hosting Readiness
- **PostgreSQL Schema (`schema.sql`)**:
  - `users`: Interviewer profiles and roles (`HEAD_INTERVIEWER`, `INTERVIEWER`, `ADMIN`).
  - `students`: Candidate directory with parsed `JSONB` Google Form submissions, live statuses, and TTL lock timestamps.
  - `interviews`: Live session tracking, timestamps, and termination reasons.
  - `evaluations`: 5-criterion rubric scoring, calculated total score, and qualitative notes.
  - `questions` & `interview_questions`: Central question library + candidate-specific modified instances.
- **Dual-mode Engine**: Connects directly to any 24/7 cloud PostgreSQL database (Neon, Supabase, Railway, Render) when `DATABASE_URL` is set, with automatic table creation and seeder scripts.

### 2. Multi-Interviewer Concurrency & Mutex Locking
- Real-time row locking prevents two interviewers from evaluating the same candidate simultaneously.
- When an interviewer starts an evaluation, other interviewers see `Locked: [Interviewer Name]`.
- Automatic 30-second heartbeat ping refreshes locks with a 5-minute safety TTL to avoid orphan locks.

### 3. Split-Screen Live Interview Workspace
- **Left Column**: Full Google Form application answers (Motivation, Prior Leadership, Situational crisis handling, Availability, CGPA).
- **Right Column**: Interactive 5-criterion rubric scoring (1 to 5), instant normalized score calculator, notes field, and debounced 500ms autosave.
- **Floating Draggable Question Modal**: Moveable overlay window with category tabs, pre-built situational questions, and in-place phrasing editor.

### 5. Bulk Import & Excel Export Capabilities
- **Bulk CSV / Form Import (`ImportModal.jsx`)**:
  - Upload CSV spreadsheets exported from Google Forms or offline tracking sheets.
  - Automatic column recognition (`Roll No`, `Name`, `Branch`, `Division`, `CGPA`, `Email`, `Phone`) with all remaining columns dynamically preserved in candidate form responses.
  - **Duplicate Preservation & Chronological Ordering**: All candidate entries are sorted by **timestamp (`created_at ASC`)** rather than roll number, perfectly matching the original Google Form submission order.
  - Candidate row preview and one-click sample template download (`sample_candidate_import_template.csv`).


- **Comprehensive Excel / CSV Export (`csvExporter.js`)**:
  - Instant one-click **"Export Excel"** button generating an Excel-compatible spreadsheet with UTF-8 BOM encoding.
  - Includes candidate demographics, status, assigned interviewer, all 5 rubric scores, overall normalized average score, qualitative notes, termination reasons, and individual Google Form responses.
- **Dynamic Table Column Customizer (`ColumnSettingsModal.jsx`)**:
  - Toggle columns on/off (Roll No, Name, Branch, Division, CGPA, Phone, Status, Actions) with persistent localStorage memory.

- **Admin-Only Board Reset / Clear (`ClearCandidatesModal.jsx`)**:
  - Secure "Clear All" button visible exclusively to **ADMIN** or **HEAD_INTERVIEWER** roles.
  - Requires typing `DELETE` into a safety confirmation dialog to prevent accidental data loss.

### 6. Universal Question Bank & In-App Sample Tools
- **GPT Prompt & JSON Schema Modal (`QuestionBankPage.jsx`)**:
  - One-click access to the exact ChatGPT / Claude prompt template.
  - One-click **"Download Sample JSON"** and **"Copy JSON"** buttons.
  - **"Load Sample Questions"**: Instantly seeds the curated 5-question placement coordinator situational bank into your live database whenever desired.
- **Universal Multi-Format Import**:
  - Supports importing questions from both `.csv` spreadsheets and `.json` arrays.
- **Printable Ideal Application Form PDF (`SampleFormPdfModal.jsx`)**:
  - Accessible via the **"Sample Form PDF"** button in the header.
  - Provides a formatted, institutional document structure covering candidate demographics, SOP, leadership history, and crisis scenarios with a one-click **"Save as PDF / Print"** button.







---

## Verification & Key Flows Tested

| Feature | Verified Behavior | Status |
| :--- | :--- | :--- |
| **Vite Production Build** | Compiled cleanly into `dist/` with 0 warnings or errors | Verified |
| **Completed Scorecard View** | Displays read-only rubric breakdown & notes without entering active edit mode | Verified |
| **Multi-Interviewer Locking** | Prevents concurrent duplicate starts; shows locked badge | Verified |
| **Autosave Engine** | Debounced background save with live indicator | Verified |
| **Floating Questions** | Smooth drag, category navigation, in-place edit | Verified |
