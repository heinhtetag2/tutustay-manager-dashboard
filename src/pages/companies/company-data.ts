export type CompanyStatus = 'Pending' | 'Approved' | 'Suspended';
export type CompanyPlan = 'Starter' | 'Growth' | 'Enterprise';

export type CompanyActivityKind =
  | 'joined'
  | 'approved'
  | 'survey-launched'
  | 'payout'
  | 'topup'
  | 'suspended';

export type CompanyActivity = {
  kind: CompanyActivityKind;
  label: string;
  detail?: string;
  date: string;
};

export type Company = {
  id: string;
  name: string;
  email: string;
  initial: string;
  status: CompanyStatus;
  plan: CompanyPlan;
  surveys: number;
  totalSpentMnt: number;
  joined: string;
  // Detail-page fields
  industry: string;
  teamSize: string;
  phone: string;
  website: string;
  address: string;
  contactPerson: string;
  contactRole: string;
  responses: number;
  creditsBalanceMnt: number;
  renewalDate: string;
  activity: CompanyActivity[];
};

function makeActivity(
  joined: string,
  status: CompanyStatus,
  extras: CompanyActivity[] = [],
): CompanyActivity[] {
  const base: CompanyActivity[] = [
    { kind: 'joined', label: 'Account created', date: joined },
  ];
  if (status !== 'Pending') {
    base.push({
      kind: 'approved',
      label: 'Application approved',
      detail: 'Reviewed by admin',
      date: new Date(new Date(joined).getTime() + 2 * 86400000).toISOString().slice(0, 10),
    });
  }
  if (status === 'Suspended') {
    base.push({
      kind: 'suspended',
      label: 'Account suspended',
      detail: 'Billing dispute under review',
      date: '2026-03-12',
    });
  }
  return [...extras, ...base].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const DEMO_COMPANIES: Company[] = [
  {
    id: 'co-001',
    name: 'MCS Group',
    email: 'info@mcs.mn',
    initial: 'M',
    status: 'Pending',
    plan: 'Enterprise',
    surveys: 31,
    totalSpentMnt: 806_000,
    joined: '2025-07-14',
    industry: 'Conglomerate',
    teamSize: '1,000+',
    phone: '+976 7011 3000',
    website: 'mcs.mn',
    address: 'MCS Tower, Sukhbaatar District, Ulaanbaatar',
    contactPerson: 'Batbold Ganbold',
    contactRole: 'Head of Marketing Intelligence',
    responses: 4_120,
    creditsBalanceMnt: 520_000,
    renewalDate: '2026-07-14',
    activity: makeActivity('2025-07-14', 'Pending'),
  },
  {
    id: 'co-002',
    name: 'Mongolian Telecom',
    email: 'hello@mobicom.mn',
    initial: 'M',
    status: 'Pending',
    plan: 'Starter',
    surveys: 21,
    totalSpentMnt: 4_413_000,
    joined: '2025-09-08',
    industry: 'Telecommunications',
    teamSize: '500–1,000',
    phone: '+976 1800 1234',
    website: 'mobicom.mn',
    address: 'Mobicom Plaza, Chingeltei District, Ulaanbaatar',
    contactPerson: 'Oyunsuren Dashzeveg',
    contactRole: 'Customer Insights Lead',
    responses: 2_890,
    creditsBalanceMnt: 180_000,
    renewalDate: '2026-09-08',
    activity: makeActivity('2025-09-08', 'Pending'),
  },
  {
    id: 'co-003',
    name: 'Khan Bank',
    email: 'digital@khanbank.mn',
    initial: 'K',
    status: 'Approved',
    plan: 'Starter',
    surveys: 28,
    totalSpentMnt: 1_515_000,
    joined: '2025-07-02',
    industry: 'Banking & Finance',
    teamSize: '1,000+',
    phone: '+976 1800 1917',
    website: 'khanbank.com',
    address: 'Khan Bank HQ, Chinggis Avenue, Ulaanbaatar',
    contactPerson: 'Erdenechimeg Munkhbat',
    contactRole: 'VP, Digital Experience',
    responses: 5_210,
    creditsBalanceMnt: 340_000,
    renewalDate: '2026-07-02',
    activity: makeActivity('2025-07-02', 'Approved', [
      {
        kind: 'survey-launched',
        label: 'Launched "Digital Banking Preferences"',
        detail: '200-response target · ₩500 per response',
        date: '2026-04-10',
      },
      {
        kind: 'topup',
        label: 'Credit top-up',
        detail: '₩1,000,000 · Growth bonus applied',
        date: '2026-03-28',
      },
    ]),
  },
  {
    id: 'co-004',
    name: 'Golomt Bank',
    email: 'info@golomtbank.mn',
    initial: 'G',
    status: 'Approved',
    plan: 'Starter',
    surveys: 10,
    totalSpentMnt: 3_357_000,
    joined: '2026-03-16',
    industry: 'Banking & Finance',
    teamSize: '500–1,000',
    phone: '+976 1800 1646',
    website: 'golomtbank.com',
    address: 'Golomt Bank HQ, Sukhbaatar Square, Ulaanbaatar',
    contactPerson: 'Tuvshinjargal Batsaikhan',
    contactRole: 'Head of Market Research',
    responses: 1_640,
    creditsBalanceMnt: 410_000,
    renewalDate: '2027-03-16',
    activity: makeActivity('2026-03-16', 'Approved'),
  },
  {
    id: 'co-005',
    name: 'APU Company',
    email: 'marketing@apu.mn',
    initial: 'A',
    status: 'Approved',
    plan: 'Enterprise',
    surveys: 11,
    totalSpentMnt: 1_773_000,
    joined: '2025-06-20',
    industry: 'Food & Beverage',
    teamSize: '500–1,000',
    phone: '+976 7014 1199',
    website: 'apu.mn',
    address: 'APU Industrial Park, Khan-Uul District, Ulaanbaatar',
    contactPerson: 'Narantuya Purevsuren',
    contactRole: 'Brand Research Manager',
    responses: 1_980,
    creditsBalanceMnt: 260_000,
    renewalDate: '2026-06-20',
    activity: makeActivity('2025-06-20', 'Approved'),
  },
  {
    id: 'co-006',
    name: 'Tenger Insurance',
    email: 'info@tenger.mn',
    initial: 'T',
    status: 'Approved',
    plan: 'Enterprise',
    surveys: 11,
    totalSpentMnt: 1_499_000,
    joined: '2025-09-25',
    industry: 'Insurance',
    teamSize: '250–500',
    phone: '+976 7014 8877',
    website: 'tenger.mn',
    address: 'Tenger Center, Chingeltei District, Ulaanbaatar',
    contactPerson: 'Bolormaa Enkhbayar',
    contactRole: 'Director of Customer Insights',
    responses: 2_110,
    creditsBalanceMnt: 190_000,
    renewalDate: '2026-09-25',
    activity: makeActivity('2025-09-25', 'Approved'),
  },
  {
    id: 'co-007',
    name: 'Nomin Holdings',
    email: 'nomin@nomin.mn',
    initial: 'N',
    status: 'Suspended',
    plan: 'Starter',
    surveys: 37,
    totalSpentMnt: 3_322_000,
    joined: '2025-11-11',
    industry: 'Retail',
    teamSize: '1,000+',
    phone: '+976 7011 7700',
    website: 'nomin.mn',
    address: 'Nomin HQ, Bayanzurkh District, Ulaanbaatar',
    contactPerson: 'Ganzorig Tserenbaljir',
    contactRole: 'Head of Consumer Research',
    responses: 3_740,
    creditsBalanceMnt: 0,
    renewalDate: '2026-11-11',
    activity: makeActivity('2025-11-11', 'Suspended'),
  },
  {
    id: 'co-008',
    name: 'Mobicom Corp',
    email: 'support@mobicom.mn',
    initial: 'M',
    status: 'Approved',
    plan: 'Enterprise',
    surveys: 19,
    totalSpentMnt: 37_000,
    joined: '2025-11-30',
    industry: 'Telecommunications',
    teamSize: '500–1,000',
    phone: '+976 1800 1800',
    website: 'mobicom.mn',
    address: 'Mobicom Headquarters, Bayanzurkh District, Ulaanbaatar',
    contactPerson: 'Munkh-Erdene Chinzorig',
    contactRole: 'Insights Director',
    responses: 420,
    creditsBalanceMnt: 80_000,
    renewalDate: '2026-11-30',
    activity: makeActivity('2025-11-30', 'Approved'),
  },
  {
    id: 'co-009',
    name: 'Gobi Cashmere',
    email: 'hello@gobi.mn',
    initial: 'G',
    status: 'Pending',
    plan: 'Growth',
    surveys: 5,
    totalSpentMnt: 120_000,
    joined: '2026-04-02',
    industry: 'Apparel',
    teamSize: '100–250',
    phone: '+976 7012 3456',
    website: 'gobi.mn',
    address: 'Gobi Cashmere Factory, Khan-Uul District, Ulaanbaatar',
    contactPerson: 'Sarangerel Dorj',
    contactRole: 'Marketing Director',
    responses: 380,
    creditsBalanceMnt: 140_000,
    renewalDate: '2027-04-02',
    activity: makeActivity('2026-04-02', 'Pending'),
  },
  {
    id: 'co-010',
    name: 'Shunkhlai Group',
    email: 'contact@shunkhlai.mn',
    initial: 'S',
    status: 'Approved',
    plan: 'Growth',
    surveys: 14,
    totalSpentMnt: 2_180_000,
    joined: '2025-08-19',
    industry: 'Energy',
    teamSize: '500–1,000',
    phone: '+976 7015 9900',
    website: 'shunkhlai.mn',
    address: 'Shunkhlai Tower, Sukhbaatar District, Ulaanbaatar',
    contactPerson: 'Baasandorj Altangerel',
    contactRole: 'Strategy & Insights',
    responses: 2_450,
    creditsBalanceMnt: 220_000,
    renewalDate: '2026-08-19',
    activity: makeActivity('2025-08-19', 'Approved'),
  },
  {
    id: 'co-011',
    name: 'TDB Bank',
    email: 'business@tdb.mn',
    initial: 'T',
    status: 'Approved',
    plan: 'Enterprise',
    surveys: 22,
    totalSpentMnt: 5_041_000,
    joined: '2025-05-04',
    industry: 'Banking & Finance',
    teamSize: '1,000+',
    phone: '+976 1800 1977',
    website: 'tdbm.mn',
    address: 'TDB Tower, Juulchin Street, Ulaanbaatar',
    contactPerson: 'Oyunchimeg Tumurbaatar',
    contactRole: 'Head of Customer Experience',
    responses: 4_880,
    creditsBalanceMnt: 610_000,
    renewalDate: '2026-05-04',
    activity: makeActivity('2025-05-04', 'Approved'),
  },
  {
    id: 'co-012',
    name: 'Erdenes Mongol',
    email: 'info@erdenes.mn',
    initial: 'E',
    status: 'Approved',
    plan: 'Enterprise',
    surveys: 18,
    totalSpentMnt: 2_867_000,
    joined: '2025-10-07',
    industry: 'Mining',
    teamSize: '1,000+',
    phone: '+976 7011 6600',
    website: 'erdenesmongol.mn',
    address: 'Erdenes Building, Chinggis Avenue, Ulaanbaatar',
    contactPerson: 'Ganbayar Munkhtuya',
    contactRole: 'Corporate Communications',
    responses: 3_120,
    creditsBalanceMnt: 290_000,
    renewalDate: '2026-10-07',
    activity: makeActivity('2025-10-07', 'Approved'),
  },
];

export function findCompanyById(id: string): Company | undefined {
  return DEMO_COMPANIES.find((c) => c.id.toLowerCase() === id.toLowerCase());
}
