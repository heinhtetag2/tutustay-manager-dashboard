export type TxKind = 'reward' | 'withdrawal' | 'bonus';
export type TxStatus = 'paid' | 'held' | 'processing' | 'failed';

export interface WalletTx {
  id: string;
  kind: TxKind;
  amountMnt: number;
  status: TxStatus;
  date: string;
  primary: string;
  secondary: string;
}

export interface WalletState {
  availableMnt: number;
  pendingMnt: number;
  thisMonthMnt: number;
  lifetimeMnt: number;
  method: {
    type: 'qpay' | 'bonum';
    label: string;
  };
  transactions: WalletTx[];
}

export const DEMO_WALLET: WalletState = {
  availableMnt: 47_000,
  pendingMnt: 8_000,
  thisMonthMnt: 42_500,
  lifetimeMnt: 284_500,
  method: {
    type: 'qpay',
    label: 'QPay · +976 99•• ••12',
  },
  transactions: [
    {
      id: 'tx-001',
      kind: 'reward',
      amountMnt: 15_000,
      status: 'paid',
      date: '2026-04-22T09:12:00',
      primary: 'Social Responsibility Survey',
      secondary: 'MCS Group',
    },
    {
      id: 'tx-002',
      kind: 'reward',
      amountMnt: 8_000,
      status: 'held',
      date: '2026-04-21T18:04:00',
      primary: 'Customer Loyalty Pulse',
      secondary: 'Khan Bank · Held 24h',
    },
    {
      id: 'tx-003',
      kind: 'withdrawal',
      amountMnt: 20_000,
      status: 'paid',
      date: '2026-04-18T11:20:00',
      primary: 'Withdrawal to QPay',
      secondary: '+976 99•• ••12',
    },
    {
      id: 'tx-004',
      kind: 'reward',
      amountMnt: 2_000,
      status: 'paid',
      date: '2026-04-17T08:32:00',
      primary: 'Service Quality Assessment',
      secondary: 'Golomt Bank',
    },
    {
      id: 'tx-005',
      kind: 'bonus',
      amountMnt: 5_000,
      status: 'paid',
      date: '2026-04-15T14:00:00',
      primary: 'Trust Lv.2 unlock bonus',
      secondary: 'Platform reward',
    },
    {
      id: 'tx-006',
      kind: 'reward',
      amountMnt: 3_000,
      status: 'paid',
      date: '2026-04-14T10:45:00',
      primary: 'Service Quality Assessment',
      secondary: 'Mongolia Telecom',
    },
    {
      id: 'tx-007',
      kind: 'withdrawal',
      amountMnt: 35_000,
      status: 'paid',
      date: '2026-04-06T09:00:00',
      primary: 'Withdrawal to QPay',
      secondary: '+976 99•• ••12',
    },
    {
      id: 'tx-008',
      kind: 'reward',
      amountMnt: 10_000,
      status: 'paid',
      date: '2026-04-04T16:22:00',
      primary: 'Organizational Culture Survey',
      secondary: 'Tenger Insurance',
    },
  ],
};
