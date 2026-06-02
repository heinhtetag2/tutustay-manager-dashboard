export type RespondentStatus = 'Active' | 'Warned' | 'Suspended';
export type TrustLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type Gender = 'Female' | 'Male' | 'Other';
export type DevicePref = 'Mobile' | 'Web' | 'Mixed';

export type RespondentSurvey = {
  id: string;
  title: string;
  company: string;
  completedAt: string;
  rewardMnt: number;
  qualityScore: number;
  status: 'Accepted' | 'Rejected';
};

export type RespondentPayout = {
  id: string;
  amountMnt: number;
  method: 'QPay' | 'Bank Transfer' | 'Social Pay';
  status: 'Paid' | 'Pending' | 'Failed';
  date: string;
};

export type RespondentEvent = {
  kind: 'joined' | 'survey' | 'payout' | 'warning' | 'suspended' | 'milestone';
  label: string;
  detail?: string;
  date: string;
};

export type Respondent = {
  id: string;
  name: string;
  email: string;
  initial: string;
  status: RespondentStatus;
  trustLevel: TrustLevel;
  surveys: number;
  qualityScore: number;
  earnedMnt: number;
  lastActive: string;
  warnings: number;
  // Detail fields
  phone: string;
  age: number;
  gender: Gender;
  district: string;
  occupation: string;
  joined: string;
  devicePref: DevicePref;
  preferredPayout: 'QPay' | 'Bank Transfer' | 'Social Pay';
  avgCompletionMin: number;
  rejectedResponses: number;
  recentSurveys: RespondentSurvey[];
  recentPayouts: RespondentPayout[];
  events: RespondentEvent[];
};

function makeSurveys(seed: string, count: number): RespondentSurvey[] {
  const titles = [
    'Organizational Culture Survey',
    'Digital Banking Preferences',
    'Customer Satisfaction Q1',
    'Brand Perception Study',
    'Product-Market Fit Check',
    'Mobile App Feedback',
    'Shopping Habits 2026',
    'Telecom Service Review',
  ];
  const companies = ['Khan Bank', 'APU Company', 'MCS Group', 'Mobicom Corp', 'Tenger Insurance', 'TDB Bank', 'Gobi Cashmere'];
  return Array.from({ length: Math.min(count, 6) }).map((_, i) => {
    const t = titles[(seed.length + i) % titles.length];
    const c = companies[(seed.length + i * 3) % companies.length];
    const day = 2 + (i * 4) % 20;
    const q = 60 + ((seed.charCodeAt(0) + i * 7) % 40);
    return {
      id: `${seed}-srv-${i + 1}`,
      title: t,
      company: c,
      completedAt: `2026-0${((i % 4) + 1)}-${String(day).padStart(2, '0')}`,
      rewardMnt: 400 + (i % 3) * 150,
      qualityScore: q,
      status: q >= 50 ? 'Accepted' : 'Rejected',
    };
  });
}

function makePayouts(seed: string, count: number): RespondentPayout[] {
  const methods: RespondentPayout['method'][] = ['QPay', 'Bank Transfer', 'Social Pay'];
  const statuses: RespondentPayout['status'][] = ['Paid', 'Paid', 'Paid', 'Pending', 'Paid'];
  return Array.from({ length: Math.min(count, 5) }).map((_, i) => ({
    id: `${seed}-pay-${i + 1}`,
    amountMnt: 20_000 + ((seed.length + i * 11) % 9) * 5_000,
    method: methods[i % methods.length],
    status: statuses[i % statuses.length],
    date: `2026-0${((i % 4) + 1)}-${String(4 + i * 5).padStart(2, '0')}`,
  }));
}

function makeEvents(respondent: Pick<Respondent, 'joined' | 'status' | 'warnings'>): RespondentEvent[] {
  const events: RespondentEvent[] = [
    { kind: 'joined', label: 'Account created', date: respondent.joined },
  ];
  events.push({
    kind: 'survey',
    label: 'Completed first survey',
    detail: 'Digital Banking Preferences · Khan Bank',
    date: '2026-02-12',
  });
  events.push({
    kind: 'milestone',
    label: 'Reached 50 surveys',
    detail: 'Quality score maintained above 70%',
    date: '2026-03-04',
  });
  events.push({
    kind: 'payout',
    label: 'Payout processed',
    detail: '50,000 via QPay',
    date: '2026-04-02',
  });
  if (respondent.warnings > 0) {
    events.push({
      kind: 'warning',
      label: 'Warning issued',
      detail: 'Rapid response pattern flagged by quality algorithm',
      date: '2026-04-08',
    });
  }
  if (respondent.status === 'Suspended') {
    events.push({
      kind: 'suspended',
      label: 'Account suspended',
      detail: 'Multiple low-quality submissions',
      date: '2026-04-14',
    });
  }
  return events.sort((a, b) => (a.date < b.date ? 1 : -1));
}

type Seed = Omit<Respondent, 'recentSurveys' | 'recentPayouts' | 'events'>;

function expand(r: Seed): Respondent {
  return {
    ...r,
    recentSurveys: makeSurveys(r.id, 6),
    recentPayouts: makePayouts(r.id, 5),
    events: makeEvents(r),
  };
}

export const DEMO_RESPONDENTS: Respondent[] = ([
  { id: 'rs-001', name: 'Munkhbat Ganzorig',    email: 'user1@example.mn',  initial: 'M', status: 'Warned',    trustLevel: 'L2', surveys: 114, qualityScore: 68, earnedMnt: 473_000, lastActive: '2026-04-19', warnings: 4, phone: '+976 8811 2234', age: 28, gender: 'Male',   district: 'Sukhbaatar',   occupation: 'Software Engineer', joined: '2025-08-14', devicePref: 'Mobile', preferredPayout: 'QPay',          avgCompletionMin: 6,  rejectedResponses: 9 },
  { id: 'rs-002', name: 'Oyuntsetseg Bayar',    email: 'user2@example.mn',  initial: 'O', status: 'Active',    trustLevel: 'L1', surveys: 136, qualityScore: 92, earnedMnt: 409_000, lastActive: '2026-03-31', warnings: 1, phone: '+976 9911 8822', age: 34, gender: 'Female', district: 'Chingeltei',   occupation: 'Marketing Manager', joined: '2025-06-02', devicePref: 'Web',    preferredPayout: 'Bank Transfer', avgCompletionMin: 8,  rejectedResponses: 2 },
  { id: 'rs-003', name: 'Otgonbayar Baatar',    email: 'user3@example.mn',  initial: 'O', status: 'Warned',    trustLevel: 'L5', surveys: 139, qualityScore: 48, earnedMnt: 449_000, lastActive: '2026-04-03', warnings: 4, phone: '+976 8822 1144', age: 41, gender: 'Male',   district: 'Bayanzurkh',   occupation: 'Accountant',        joined: '2025-05-20', devicePref: 'Mixed',  preferredPayout: 'QPay',          avgCompletionMin: 5,  rejectedResponses: 15 },
  { id: 'rs-004', name: 'Ganbold Ganzorig',     email: 'user4@example.mn',  initial: 'G', status: 'Warned',    trustLevel: 'L1', surveys:  78, qualityScore: 54, earnedMnt: 355_000, lastActive: '2026-04-07', warnings: 2, phone: '+976 9988 3322', age: 26, gender: 'Male',   district: 'Khan-Uul',     occupation: 'Graphic Designer',  joined: '2025-09-11', devicePref: 'Mobile', preferredPayout: 'Social Pay',    avgCompletionMin: 7,  rejectedResponses: 6 },
  { id: 'rs-005', name: 'Narantuya Tseren',     email: 'user5@example.mn',  initial: 'N', status: 'Active',    trustLevel: 'L1', surveys:  24, qualityScore: 83, earnedMnt: 352_000, lastActive: '2026-03-20', warnings: 0, phone: '+976 9944 7711', age: 30, gender: 'Female', district: 'Bayangol',     occupation: 'Teacher',           joined: '2026-01-08', devicePref: 'Mobile', preferredPayout: 'QPay',          avgCompletionMin: 9,  rejectedResponses: 0 },
  { id: 'rs-006', name: 'Ganbold Sukh',         email: 'user6@example.mn',  initial: 'G', status: 'Active',    trustLevel: 'L4', surveys: 167, qualityScore: 49, earnedMnt: 258_000, lastActive: '2026-04-05', warnings: 3, phone: '+976 8833 5566', age: 37, gender: 'Male',   district: 'Sukhbaatar',   occupation: 'Driver',            joined: '2025-04-17', devicePref: 'Mobile', preferredPayout: 'QPay',          avgCompletionMin: 4,  rejectedResponses: 12 },
  { id: 'rs-007', name: 'Otgon Tsegmid',        email: 'user7@example.mn',  initial: 'O', status: 'Active',    trustLevel: 'L1', surveys: 189, qualityScore: 62, earnedMnt: 128_000, lastActive: '2026-04-08', warnings: 3, phone: '+976 9900 1122', age: 33, gender: 'Female', district: 'Chingeltei',   occupation: 'Retail Staff',      joined: '2025-03-29', devicePref: 'Web',    preferredPayout: 'Bank Transfer', avgCompletionMin: 6,  rejectedResponses: 8 },
  { id: 'rs-008', name: 'Oyunchimeg Bold',      email: 'user8@example.mn',  initial: 'O', status: 'Active',    trustLevel: 'L2', surveys:  19, qualityScore: 92, earnedMnt: 110_000, lastActive: '2026-04-16', warnings: 3, phone: '+976 9922 8844', age: 25, gender: 'Female', district: 'Bayanzurkh',   occupation: 'Student',           joined: '2026-02-03', devicePref: 'Mobile', preferredPayout: 'QPay',          avgCompletionMin: 10, rejectedResponses: 1 },
  { id: 'rs-009', name: 'Saruul Enkhbayar',     email: 'user9@example.mn',  initial: 'S', status: 'Active',    trustLevel: 'L3', surveys:  56, qualityScore: 78, earnedMnt: 198_000, lastActive: '2026-04-18', warnings: 0, phone: '+976 8811 4477', age: 29, gender: 'Female', district: 'Khan-Uul',     occupation: 'HR Specialist',     joined: '2025-10-25', devicePref: 'Mixed',  preferredPayout: 'Social Pay',    avgCompletionMin: 8,  rejectedResponses: 2 },
  { id: 'rs-010', name: 'Bold Chinzorig',       email: 'user10@example.mn', initial: 'B', status: 'Suspended', trustLevel: 'L1', surveys: 201, qualityScore: 31, earnedMnt: 612_000, lastActive: '2026-02-11', warnings: 7, phone: '+976 9933 6655', age: 44, gender: 'Male',   district: 'Bayangol',     occupation: 'Freelancer',        joined: '2025-01-14', devicePref: 'Mixed',  preferredPayout: 'QPay',          avgCompletionMin: 3,  rejectedResponses: 38 },
  { id: 'rs-011', name: 'Tuya Munkhjargal',     email: 'user11@example.mn', initial: 'T', status: 'Active',    trustLevel: 'L5', surveys:  88, qualityScore: 95, earnedMnt: 521_000, lastActive: '2026-04-20', warnings: 0, phone: '+976 9955 3311', age: 31, gender: 'Female', district: 'Chingeltei',   occupation: 'Researcher',        joined: '2025-07-03', devicePref: 'Web',    preferredPayout: 'Bank Transfer', avgCompletionMin: 11, rejectedResponses: 0 },
  { id: 'rs-012', name: 'Altangerel Erdene',    email: 'user12@example.mn', initial: 'A', status: 'Active',    trustLevel: 'L3', surveys:  42, qualityScore: 81, earnedMnt: 164_000, lastActive: '2026-04-12', warnings: 1, phone: '+976 8844 7722', age: 27, gender: 'Male',   district: 'Sukhbaatar',   occupation: 'Barista',           joined: '2025-11-19', devicePref: 'Mobile', preferredPayout: 'QPay',          avgCompletionMin: 7,  rejectedResponses: 2 },
  { id: 'rs-013', name: 'Bayarmaa Tserendorj',  email: 'user13@example.mn', initial: 'B', status: 'Active',    trustLevel: 'L4', surveys: 103, qualityScore: 86, earnedMnt: 388_000, lastActive: '2026-04-15', warnings: 1, phone: '+976 9966 2244', age: 36, gender: 'Female', district: 'Bayanzurkh',   occupation: 'Nurse',             joined: '2025-02-08', devicePref: 'Mobile', preferredPayout: 'Social Pay',    avgCompletionMin: 9,  rejectedResponses: 3 },
  { id: 'rs-014', name: 'Dorj Munkhtuya',       email: 'user14@example.mn', initial: 'D', status: 'Warned',    trustLevel: 'L2', surveys:  65, qualityScore: 58, earnedMnt: 221_000, lastActive: '2026-03-28', warnings: 2, phone: '+976 8855 9911', age: 39, gender: 'Male',   district: 'Khan-Uul',     occupation: 'Mechanic',          joined: '2025-08-27', devicePref: 'Mobile', preferredPayout: 'QPay',          avgCompletionMin: 5,  rejectedResponses: 5 },
  { id: 'rs-015', name: 'Enkhjin Purevsuren',   email: 'user15@example.mn', initial: 'E', status: 'Active',    trustLevel: 'L2', surveys:  37, qualityScore: 74, earnedMnt:  96_000, lastActive: '2026-04-17', warnings: 0, phone: '+976 9977 8833', age: 24, gender: 'Female', district: 'Bayangol',     occupation: 'Student',           joined: '2026-01-30', devicePref: 'Mobile', preferredPayout: 'Social Pay',    avgCompletionMin: 8,  rejectedResponses: 1 },
  { id: 'rs-016', name: 'Khulan Batsaikhan',    email: 'user16@example.mn', initial: 'K', status: 'Active',    trustLevel: 'L3', surveys: 144, qualityScore: 84, earnedMnt: 432_000, lastActive: '2026-04-14', warnings: 0, phone: '+976 8866 3377', age: 32, gender: 'Female', district: 'Sukhbaatar',   occupation: 'Data Analyst',      joined: '2025-03-15', devicePref: 'Web',    preferredPayout: 'Bank Transfer', avgCompletionMin: 10, rejectedResponses: 2 },
  { id: 'rs-017', name: 'Nomin Batbayar',       email: 'user17@example.mn', initial: 'N', status: 'Suspended', trustLevel: 'L1', surveys: 220, qualityScore: 28, earnedMnt: 745_000, lastActive: '2026-01-22', warnings: 9, phone: '+976 9988 5522', age: 46, gender: 'Male',   district: 'Chingeltei',   occupation: 'Self-employed',     joined: '2024-12-02', devicePref: 'Mixed',  preferredPayout: 'QPay',          avgCompletionMin: 3,  rejectedResponses: 52 },
  { id: 'rs-018', name: 'Tumendemberel Ochir',  email: 'user18@example.mn', initial: 'T', status: 'Active',    trustLevel: 'L4', surveys:  91, qualityScore: 79, earnedMnt: 267_000, lastActive: '2026-04-11', warnings: 1, phone: '+976 8877 4411', age: 35, gender: 'Male',   district: 'Bayanzurkh',   occupation: 'Consultant',        joined: '2025-06-21', devicePref: 'Mixed',  preferredPayout: 'Social Pay',    avgCompletionMin: 8,  rejectedResponses: 3 },
  { id: 'rs-019', name: 'Ulzii Dashnyam',       email: 'user19@example.mn', initial: 'U', status: 'Active',    trustLevel: 'L5', surveys: 175, qualityScore: 93, earnedMnt: 588_000, lastActive: '2026-04-19', warnings: 0, phone: '+976 9900 7733', age: 38, gender: 'Female', district: 'Khan-Uul',     occupation: 'Entrepreneur',      joined: '2025-02-17', devicePref: 'Mobile', preferredPayout: 'QPay',          avgCompletionMin: 11, rejectedResponses: 1 },
  { id: 'rs-020', name: 'Zoljargal Tsend',      email: 'user20@example.mn', initial: 'Z', status: 'Active',    trustLevel: 'L2', surveys:  28, qualityScore: 71, earnedMnt:  82_000, lastActive: '2026-04-09', warnings: 0, phone: '+976 8833 9977', age: 23, gender: 'Female', district: 'Bayangol',     occupation: 'Junior Designer',   joined: '2026-02-24', devicePref: 'Mobile', preferredPayout: 'QPay',          avgCompletionMin: 9,  rejectedResponses: 0 },
] as Seed[]).map(expand);

export function findRespondentById(id: string): Respondent | undefined {
  return DEMO_RESPONDENTS.find((r) => r.id.toLowerCase() === id.toLowerCase());
}
