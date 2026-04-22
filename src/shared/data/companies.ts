export type Company = {
  name: string;
  initials: string;
  industry: string;
  headquarters: string;
  employees: string;
  website: string;
  description: string;
  verifiedSince: string;
  totalSurveys: number;
  avgRewardMnt: number;
  acceptanceRate: number;
};

const COMPANIES: Record<string, Company> = {
  'MCS Group': {
    name: 'MCS Group',
    initials: 'MC',
    industry: 'Conglomerate',
    headquarters: 'Ulaanbaatar, MN',
    employees: '5,000+',
    website: 'https://mcs.mn',
    description:
      'One of Mongolia\'s largest private holding groups, operating across beverages, retail, IT, and real estate. Uses iDap for social and HR research across its operating companies.',
    verifiedSince: 'Apr 2024',
    totalSurveys: 42,
    avgRewardMnt: 12_500,
    acceptanceRate: 94,
  },
  'Mongolia Telecom': {
    name: 'Mongolia Telecom',
    initials: 'MT',
    industry: 'Telecommunications',
    headquarters: 'Ulaanbaatar, MN',
    employees: '1,500+',
    website: 'https://mobinet.mn',
    description:
      'State-affiliated telecom operator running fixed-line, mobile, and data services. Runs recurring product and service-quality research across customer segments.',
    verifiedSince: 'Mar 2024',
    totalSurveys: 28,
    avgRewardMnt: 6_000,
    acceptanceRate: 91,
  },
  'Khan Bank': {
    name: 'Khan Bank',
    initials: 'KB',
    industry: 'Banking',
    headquarters: 'Ulaanbaatar, MN',
    employees: '6,000+',
    website: 'https://khanbank.com',
    description:
      "Mongolia's largest commercial bank, serving over 2 million customers. Uses iDap for brand perception, product feedback, and loyalty studies.",
    verifiedSince: 'Feb 2024',
    totalSurveys: 51,
    avgRewardMnt: 11_000,
    acceptanceRate: 96,
  },
  'Golomt Bank': {
    name: 'Golomt Bank',
    initials: 'GB',
    industry: 'Banking',
    headquarters: 'Ulaanbaatar, MN',
    employees: '3,500+',
    website: 'https://golomtbank.com',
    description:
      'Major commercial bank focused on corporate and retail banking, with a strong digital banking product. Runs usability and service-quality research.',
    verifiedSince: 'Apr 2024',
    totalSurveys: 33,
    avgRewardMnt: 9_800,
    acceptanceRate: 93,
  },
  'Tenger Insurance': {
    name: 'Tenger Insurance',
    initials: 'TI',
    industry: 'Insurance',
    headquarters: 'Ulaanbaatar, MN',
    employees: '800+',
    website: 'https://tengerinsurance.mn',
    description:
      'General insurance provider covering property, motor, health, and travel. Uses iDap for brand and service-quality studies.',
    verifiedSince: 'May 2024',
    totalSurveys: 18,
    avgRewardMnt: 10_500,
    acceptanceRate: 89,
  },
  'Ard Financial': {
    name: 'Ard Financial',
    initials: 'AF',
    industry: 'Financial Services',
    headquarters: 'Ulaanbaatar, MN',
    employees: '1,200+',
    website: 'https://ardholdings.com',
    description:
      'Financial services group covering insurance, asset management, and investments. Researches saving and investing behavior.',
    verifiedSince: 'Jun 2024',
    totalSurveys: 22,
    avgRewardMnt: 12_000,
    acceptanceRate: 92,
  },
  'Unitel': {
    name: 'Unitel',
    initials: 'UN',
    industry: 'Telecommunications',
    headquarters: 'Ulaanbaatar, MN',
    employees: '2,000+',
    website: 'https://unitel.mn',
    description:
      'Mobile network operator known for its 5G coverage and digital products. Runs product and coverage-experience research regularly.',
    verifiedSince: 'Mar 2024',
    totalSurveys: 24,
    avgRewardMnt: 7_500,
    acceptanceRate: 95,
  },
  'Shangri-La UB': {
    name: 'Shangri-La UB',
    initials: 'SL',
    industry: 'Hospitality',
    headquarters: 'Ulaanbaatar, MN',
    employees: '500+',
    website: 'https://shangri-la.com/ulaanbaatar',
    description:
      '5-star hotel and conference complex in the heart of Ulaanbaatar. Surveys recent guests on their stay experience.',
    verifiedSince: 'Jul 2024',
    totalSurveys: 9,
    avgRewardMnt: 18_000,
    acceptanceRate: 88,
  },
  'APU Company': {
    name: 'APU Company',
    initials: 'AP',
    industry: 'Beverages',
    headquarters: 'Ulaanbaatar, MN',
    employees: '2,500+',
    website: 'https://apu.mn',
    description:
      "Mongolia's largest beverage producer, with soft drinks, water, beer, and spirits. Runs taste, brand, and consumption research.",
    verifiedSince: 'Feb 2024',
    totalSurveys: 37,
    avgRewardMnt: 4_500,
    acceptanceRate: 97,
  },
  'Trade & Development Bank': {
    name: 'Trade & Development Bank',
    initials: 'TD',
    industry: 'Banking',
    headquarters: 'Ulaanbaatar, MN',
    employees: '2,800+',
    website: 'https://tdbm.mn',
    description:
      'Full-service commercial bank focused on SME and corporate lending, plus consumer banking. Runs mortgage and lending experience research.',
    verifiedSince: 'May 2024',
    totalSurveys: 19,
    avgRewardMnt: 15_000,
    acceptanceRate: 90,
  },
  'Gobi Cashmere': {
    name: 'Gobi Cashmere',
    initials: 'GC',
    industry: 'Apparel & Textiles',
    headquarters: 'Ulaanbaatar, MN',
    employees: '2,000+',
    website: 'https://gobi.mn',
    description:
      'Vertically integrated cashmere manufacturer and retailer exporting to 40+ countries. Runs brand-perception research with local and international respondents.',
    verifiedSince: 'Aug 2024',
    totalSurveys: 12,
    avgRewardMnt: 9_000,
    acceptanceRate: 93,
  },
  'State Bank': {
    name: 'State Bank',
    initials: 'SB',
    industry: 'Banking',
    headquarters: 'Ulaanbaatar, MN',
    employees: '4,000+',
    website: 'https://statebank.mn',
    description:
      'State-owned commercial bank with the largest branch network in Mongolia. Researches branch versus digital banking preferences.',
    verifiedSince: 'Jun 2024',
    totalSurveys: 15,
    avgRewardMnt: 5_500,
    acceptanceRate: 91,
  },
  'Mobicom': {
    name: 'Mobicom',
    initials: 'MB',
    industry: 'Telecommunications',
    headquarters: 'Ulaanbaatar, MN',
    employees: '1,800+',
    website: 'https://mobicom.mn',
    description:
      "Mongolia's first mobile operator, offering mobile, fixed, and digital services. Frequently runs household data-plan research.",
    verifiedSince: 'Apr 2024',
    totalSurveys: 21,
    avgRewardMnt: 5_000,
    acceptanceRate: 94,
  },
  'Nomin Holding': {
    name: 'Nomin Holding',
    initials: 'NH',
    industry: 'Retail',
    headquarters: 'Ulaanbaatar, MN',
    employees: '5,500+',
    website: 'https://nominholding.mn',
    description:
      'Diversified retail group operating supermarkets, electronics stores, and restaurants. Researches weekly shopping habits and store experience.',
    verifiedSince: 'Jul 2024',
    totalSurveys: 25,
    avgRewardMnt: 4_200,
    acceptanceRate: 96,
  },
  'Tavan Bogd Group': {
    name: 'Tavan Bogd Group',
    initials: 'TB',
    industry: 'Conglomerate',
    headquarters: 'Ulaanbaatar, MN',
    employees: '3,000+',
    website: 'https://tavanbogd.com',
    description:
      'Business group across tourism, agriculture, automotive, and tech. Runs HR and workplace research across operating companies.',
    verifiedSince: 'May 2024',
    totalSurveys: 16,
    avgRewardMnt: 10_800,
    acceptanceRate: 89,
  },
  'Xac Bank': {
    name: 'Xac Bank',
    initials: 'XB',
    industry: 'Banking',
    headquarters: 'Ulaanbaatar, MN',
    employees: '1,800+',
    website: 'https://xacbank.mn',
    description:
      'Commercial bank with a strong focus on SME and sustainable finance. Researches awareness of green finance products.',
    verifiedSince: 'Aug 2024',
    totalSurveys: 11,
    avgRewardMnt: 6_500,
    acceptanceRate: 92,
  },
  'Erdenet Mining': {
    name: 'Erdenet Mining',
    initials: 'EM',
    industry: 'Mining',
    headquarters: 'Erdenet, MN',
    employees: '6,500+',
    website: 'https://erdenetmc.mn',
    description:
      'One of the largest copper and molybdenum mining operations in Asia. Runs community-impact research with residents near operations.',
    verifiedSince: 'Sep 2024',
    totalSurveys: 7,
    avgRewardMnt: 14_000,
    acceptanceRate: 86,
  },
};

export function getCompanyByName(name: string | undefined): Company | undefined {
  if (!name) return undefined;
  return COMPANIES[name];
}
