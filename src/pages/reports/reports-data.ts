export type ReportStatus = 'Open' | 'Reviewing' | 'Resolved' | 'Dismissed';
export type ReportSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type ReportReason =
  | 'Spam'
  | 'Fraud'
  | 'Low quality'
  | 'Abuse'
  | 'Off-topic';

export interface Report {
  id: string;
  /** Single-letter avatar for the reported respondent. */
  initial: string;
  reportedName: string;
  reportedEmail: string;
  reason: ReportReason;
  surveyTitle: string;
  surveyCategory: string;
  /** Who raised the report — a company name or 'System'. */
  reporter: string;
  severity: ReportSeverity;
  /** ISO date the report was filed. */
  reportedAt: string;
  status: ReportStatus;
}

export const DEMO_REPORTS: Report[] = [
  {
    id: 'RPT-1042',
    initial: 'M',
    reportedName: 'Munkhbat Ganzorig',
    reportedEmail: 'user1@example.mn',
    reason: 'Spam',
    surveyTitle: 'Brand Awareness Survey',
    surveyCategory: 'Brand',
    reporter: 'Khan Bank',
    severity: 'High',
    reportedAt: '2026-05-27',
    status: 'Open',
  },
  {
    id: 'RPT-1041',
    initial: 'O',
    reportedName: 'Otgonbayar Baatar',
    reportedEmail: 'user3@example.mn',
    reason: 'Fraud',
    surveyTitle: 'Export Brand Perception',
    surveyCategory: 'Finance',
    reporter: 'System',
    severity: 'Critical',
    reportedAt: '2026-05-26',
    status: 'Open',
  },
  {
    id: 'RPT-1040',
    initial: 'G',
    reportedName: 'Ganbold Ganzorig',
    reportedEmail: 'user4@example.mn',
    reason: 'Low quality',
    surveyTitle: 'Service Quality Assessment',
    surveyCategory: 'Product',
    reporter: 'Golomt Bank',
    severity: 'Medium',
    reportedAt: '2026-05-25',
    status: 'Reviewing',
  },
  {
    id: 'RPT-1039',
    initial: 'N',
    reportedName: 'Narantuya Tseren',
    reportedEmail: 'user5@example.mn',
    reason: 'Off-topic',
    surveyTitle: 'Grocery Habits Study',
    surveyCategory: 'Social',
    reporter: 'System',
    severity: 'Low',
    reportedAt: '2026-05-24',
    status: 'Reviewing',
  },
  {
    id: 'RPT-1038',
    initial: 'G',
    reportedName: 'Ganbold Sukh',
    reportedEmail: 'user6@example.mn',
    reason: 'Abuse',
    surveyTitle: '5G Rollout Feedback',
    surveyCategory: 'Product',
    reporter: 'Mobicom',
    severity: 'High',
    reportedAt: '2026-05-22',
    status: 'Open',
  },
  {
    id: 'RPT-1037',
    initial: 'O',
    reportedName: 'Otgon Tsegmid',
    reportedEmail: 'user7@example.mn',
    reason: 'Spam',
    surveyTitle: 'Beverage Taste Test',
    surveyCategory: 'Brand',
    reporter: 'APU Company',
    severity: 'Low',
    reportedAt: '2026-05-21',
    status: 'Dismissed',
  },
  {
    id: 'RPT-1036',
    initial: 'O',
    reportedName: 'Oyunchimeg Bold',
    reportedEmail: 'user8@example.mn',
    reason: 'Fraud',
    surveyTitle: 'Insurance Satisfaction',
    surveyCategory: 'Finance',
    reporter: 'System',
    severity: 'Critical',
    reportedAt: '2026-05-20',
    status: 'Resolved',
  },
  {
    id: 'RPT-1035',
    initial: 'B',
    reportedName: 'Batbayar Dorj',
    reportedEmail: 'user9@example.mn',
    reason: 'Low quality',
    surveyTitle: 'Customer Loyalty Study',
    surveyCategory: 'Brand',
    reporter: 'Khan Bank',
    severity: 'Medium',
    reportedAt: '2026-05-19',
    status: 'Open',
  },
  {
    id: 'RPT-1034',
    initial: 'T',
    reportedName: 'Tuvshinbayar Erden',
    reportedEmail: 'user10@example.mn',
    reason: 'Abuse',
    surveyTitle: 'Cashmere Export Research',
    surveyCategory: 'Market Research',
    reporter: 'Gobi Cashmere',
    severity: 'High',
    reportedAt: '2026-05-18',
    status: 'Reviewing',
  },
  {
    id: 'RPT-1033',
    initial: 'S',
    reportedName: 'Saruul Enkh',
    reportedEmail: 'user11@example.mn',
    reason: 'Off-topic',
    surveyTitle: 'Travel Insurance Feedback',
    surveyCategory: 'Finance',
    reporter: 'System',
    severity: 'Low',
    reportedAt: '2026-05-16',
    status: 'Resolved',
  },
  {
    id: 'RPT-1032',
    initial: 'A',
    reportedName: 'Anar Bat',
    reportedEmail: 'user12@example.mn',
    reason: 'Spam',
    surveyTitle: 'Soft Drink Preferences',
    surveyCategory: 'Brand',
    reporter: 'APU Company',
    severity: 'Medium',
    reportedAt: '2026-05-15',
    status: 'Open',
  },
  {
    id: 'RPT-1031',
    initial: 'E',
    reportedName: 'Enkhjin Tumen',
    reportedEmail: 'user13@example.mn',
    reason: 'Fraud',
    surveyTitle: 'Mobile Plan Survey',
    surveyCategory: 'Product',
    reporter: 'Mobicom',
    severity: 'Critical',
    reportedAt: '2026-05-13',
    status: 'Dismissed',
  },
];
