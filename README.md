# 👔 EvalSheet Enterprise™ 
### *The Universal Synergistic Candidate Evaluation & Bandwidth Optimization Matrix*

> *"Evaluating human capital so you don't circle back into regret."* — **Anonymous VP of Synergistic Governance**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Synergy: 100%](https://img.shields.io/badge/Synergy-100%25-brightgreen.svg)]()
[![Low--Hanging--Fruit: Picked](https://img.shields.io/badge/Low--Hanging--Fruit-Picked-orange.svg)]()
[![Bandwidth: Unlimited](https://img.shields.io/badge/Bandwidth-Maximized-2563eb.svg)]()
[![PostgreSQL: 24/7](https://img.shields.io/badge/Database-PostgreSQL-336791.svg)]()

---

## 📌 Executive Summary (Per My Last Email)

Are your interviewers clashing on candidates like two PMs arguing over button padding? Are candidates mysteriously vanishing into the cryogenic void of forgotten spreadsheets? 

**EvalSheet Enterprise™** is a battle-tested, distraction-free corporate cockpit engineered with a strict **two-color minimalist aesthetic** (`#0F172A` Slate Charcoal + `#2563EB` Precision Cobalt). It synchronizes multi-interviewer evaluations, enforces real-time mutex locking, and parses candidate Google Form submissions before your lukewarm corporate drip coffee gets cold.

```
                  ┌────────────────────────────────────────┐
                  │          Google Form Responses         │
                  └───────────────────┬────────────────────┘
                                      │ (1-Click CSV Import)
                                      ▼
                  ┌────────────────────────────────────────┐
                  │      EvalSheet Concurrency Matrix      │
                  │   [Mutex Locking • 30s Heartbeats]     │
                  └───────┬────────────────────────┬───────┘
                          │                        │
               Interviewer A (Evaluating)    Interviewer B (Locked Out)
                          │                        │
                          ▼                        ▼
                  ┌───────────────┐        ┌───────────────┐
                  │ Active Rubric │        │ "🔒 Locked by │
                  │ + Auto-Save   │        │ Interviewer A"│
                  └───────┬───────┘        └───────────────┘
                          │
                          ▼
                  ┌────────────────────────────────────────┐
                  │       PostgreSQL 24/7 Neon Cloud       │
                  │   (Export to Excel • UTF-8 CSV BOM)    │
                  └────────────────────────────────────────┘
```

---

## ⚡ Core Synergistic Deliverables

### 🔒 1. Mutex Candidate Locking (Anti-Spacetime Rupture)
* When **Interviewer A** initiates an evaluation, the candidate is locked in real-time across all other interviewer dashboards (`Locked: Interviewer A`).
* Prevents two evaluators from assessing the same candidate simultaneously and creating a corporate paradox.
* Built-in **30-second heartbeats** and **5-minute safety TTL auto-unlock** so if an interviewer’s Wi-Fi explodes mid-interview, the candidate is automatically freed.

### 📋 2. Universal Google Form Application Cockpit
* **Left Pane**: Candidate identity (Full Name, Roll/PRN, Department, CGPA, Phone/WhatsApp, Email) and dynamic qualitative responses (Motivation SOP, Prior Leadership, Situational Aptitude).
* **Right Pane**: 5-criterion rubric scoring (`Communication`, `Coordination`, `Problem Solving`, `Professionalism`, `Stakeholder Rapport`) with live weighted averages and debounced autosaving notes.
* **Floating Draggable Question Bank**: Draggable modal with in-place question phrasing customizer for specific candidate interviews.

### ⏱️ 3. Structured Candidate Lifecycles
* **`Save & Exit`**: Pauses the session and preserves the lock for later continuation.
* **`Cut Interview`**: Standardized early termination taxonomy (*"Severe Connectivity Disruption"*, *"Candidate Withdrew"*, *"Academic Mismatch"*) with mandatory audit logging.
* **`Complete & Submit`**: Calculates final scorecard, archives the candidate, and unlocks a read-only printable scorecard modal.

### 📊 4. Universal CSV / Excel Pipeline & Zero-Duplicate Drops
* **Preserves Duplicate Applicants**: If 3 students apply with the same roll number or duplicate records, EvalSheet retains all rows with distinct IDs without dropping data.
* **Chronological Ordering**: Candidates are sorted strictly by submission timestamps, not arbitrary roll number alphabets.
* **1-Click Export**: Downloads complete evaluation data with UTF-8 BOM encoding for seamless opening in Microsoft Excel.

---

## 🎭 The Satirical First Page & Meme Carousel

Because HR and technical hiring without memes is a OSHA compliance violation:
* **The Landing Page**: Loaded with deadpan corporate satire, executive boardroom artwork (`corp_hero.jpg`), and corporate jargon badges.
* **Scrollable Meme Showcase**: Horizontally scrollable carousel containing **10 uncropped, high-res corporate & interview meme cards**.
* **Clean Boundary**: The funny stuff is strictly isolated to the first page. Once you click **`Enter Professional Portal`**, the internal evaluation engine is **100% corporate, sleek, and distraction-free**.

---

## 📋 Exact Google Form Blueprint (For Non-Tech HRs)

Create a blank form on [forms.google.com](https://forms.google.com) with these exact question titles for automatic mapping:

| # | Google Form Question Title | Type | Required? | Mapped EvalSheet Field |
| :- | :--- | :--- | :-: | :--- |
| 1 | **`Full Name`** | Short answer | **Yes** | Candidate Title |
| 2 | **`Roll Number`** | Short answer | **Yes** | PRN / Candidate ID |
| 3 | **`Department`** | Dropdown / Short text | **Yes** | Branch / Domain Tag |
| 4 | **`Division`** | Short answer | **Yes** | Section / Cohort |
| 5 | **`Current Aggregate CGPA`** | Short answer (Number) | No | Academic Metric |
| 6 | **`Official College Email`** | Short answer (Email) | **Yes** | Contact Profile |
| 7 | **`Contact Phone (WhatsApp)`** | Short answer | **Yes** | Direct Phone / WhatsApp |
| 8 | **`Why are you applying for this role?`** | Paragraph | No | Candidate Cockpit Q&A |
| 9 | **`Key strengths & prior experience`** | Paragraph | No | Candidate Cockpit Q&A |
| 10 | **`Describe a challenging situation handled under pressure`** | Paragraph | No | Candidate Cockpit Q&A |
| 11 | **`Availability and scheduling constraints`** | Multiple choice | No | Candidate Cockpit Q&A |

> **To Import**: In Google Forms $\rightarrow$ Responses $\rightarrow$ Download `.csv` $\rightarrow$ Open EvalSheet $\rightarrow$ Click **`Import CSV`**. Done.

---

## 🚀 Quick-Start & 24/7 Cloud Deployment

### 1. Database Setup (Neon PostgreSQL)
1. Create a free serverless database at **[Neon.tech](https://neon.tech)** (or Supabase / Render Postgres).
2. Copy your connection URI and add it to your `.env` file:
```env
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
PORT=5000
```

### 2. Run Locally
```bash
# 1. Install dependencies
npm install

# 2. Build frontend production bundle
npm run build

# 3. Start API + Static Server (Port 5000)
npm run server
```
* Visit `http://localhost:5000` to access the portal.
* The first user registered via the UI is automatically granted the **`ADMIN`** role.

### 3. Deploy to Render / Railway / Vercel (1-Click)
* **Build Command**: `npm install && npm run build`
* **Start Command**: `node server/index.js`
* **Environment Variable**: `DATABASE_URL` = Your Neon Postgres connection string.

---

## ❓ Frequently Answered Queries (FAQ)

**Q: Can I use this for non-tech roles, student councils, or club interviews?**  
*A: Yes! EvalSheet is 100% universal. The questions, rubrics, and candidate profiles dynamically adjust to any domain.*

**Q: Can two interviewers evaluate Candidate 42 at the same time?**  
*A: Absolutely not. Candidate 42 will be locked to the first interviewer. The second interviewer will see a lock indicator until the session ends or is paused.*

**Q: Can I use this to evaluate a cat in a business tie?**  
*A: Yes. In fact, our boardroom evaluation matrix concluded the cat has superior communication metrics and fewer unread emails (see Fig 1.1 on the landing page).*

---

## ⚖️ Corporate Disclaimer
*No low-hanging fruit was harmed during the development of this repository. Touch base responsibly.*

Distributed under the **MIT License**. Synergized with ❤️ for high-bandwidth teams worldwide.
