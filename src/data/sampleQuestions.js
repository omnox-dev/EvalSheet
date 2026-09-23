export const SAMPLE_QUESTIONS_JSON = [
  {
    category: "Problem Solving & Execution",
    question_text: "A critical task or deliverable is due in 3 hours, and a core dependency fails or an unexpected blocker occurs. Walk us through your exact decision-making process.",
    expected_behavior: "Stays composed, identifies root causes, communicates transparently with stakeholders, implements practical triage or fallback, and drives execution.",
    follow_up: "How do you decide what compromises or trade-offs are acceptable versus non-negotiable under severe time constraints?"
  },
  {
    category: "Crisis & Stakeholder Communication",
    question_text: "A key external partner or client is visibly dissatisfied with a recent update and expresses frustration directly to you. How do you handle the conversation?",
    expected_behavior: "Listens actively without defensiveness, validates concerns, takes accountability on behalf of the team, and outlines a concrete resolution roadmap.",
    follow_up: "What exact words or strategies do you use to de-escalate tension and rebuild confidence?"
  },
  {
    category: "Team Coordination & Conflict",
    question_text: "Two team members have a strong disagreement on the approach for an important milestone, causing delays. How do you step in to resolve it?",
    expected_behavior: "Facilitates objective discussion focused on goals and data rather than egos, seeks consensus, or makes a reasoned call while keeping team morale high.",
    follow_up: "How do you re-engage a team member whose proposed idea was not chosen?"
  },
  {
    category: "Ethics, Integrity & Confidentiality",
    question_text: "You are entrusted with confidential project or organizational data, and a close friend or colleague asks you for off-the-record access or insights. How do you respond?",
    expected_behavior: "Maintains absolute integrity and policy adherence, declines politely but firmly, explains the reasoning clearly, and provides general guidance only.",
    follow_up: "What if they push back or accuse you of not being a supportive team player?"
  },
  {
    category: "Leadership & Work Ethic",
    question_text: "Describe a situation where a project required substantial extra effort, extended hours, or shifting priorities. How did you manage your stamina and accountability?",
    expected_behavior: "Demonstrates high resilience, intrinsic drive, effective workload prioritization, and a collaborative spirit.",
    follow_up: "How do you ensure quality and attention to detail don't suffer when operating under fatigue or tight deadlines?"
  }
];

export const GPT_PROMPT_TEMPLATE = `Generate 20 high-quality, realistic situational, behavioral, and competency-based interview questions for evaluating candidates in [INSERT YOUR ROLE OR DOMAIN, e.g. Software Engineering / Student Council / Operations / Product / HR]. 

Output ONLY a valid JSON array of objects with the following keys for each question:
- category: String (e.g., 'Problem Solving', 'Communication', 'Conflict Resolution', 'Ethics & Integrity', 'Leadership')
- question_text: String (Realistic operational scenario, dilemma, or technical case)
- expected_behavior: String (Key traits, actions, and rubric criteria interviewers should look for)
- follow_up: String (A sharp secondary probing question to test depth)`;
