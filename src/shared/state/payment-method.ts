import { useSyncExternalStore } from 'react';

export type PaymentGateway = 'qpay' | 'bonum' | 'socialpay';

export interface PaymentMethod {
  gateway: PaymentGateway;
  phone: string;
  accountName: string;
  linkedAt: string;
}

let current: PaymentMethod | null = {
  gateway: 'qpay',
  phone: '+97699991212',
  accountName: 'Hein Htet',
  linkedAt: '2026-03-12T09:00:00',
};

const listeners = new Set<() => void>();

function getSnapshot() {
  return current;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function setPaymentMethod(method: PaymentMethod | null) {
  current = method;
  listeners.forEach((l) => l());
}

export function usePaymentMethod() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const GATEWAY_LABEL: Record<PaymentGateway, string> = {
  qpay: 'QPay',
  bonum: 'Bonum',
  socialpay: 'SocialPay',
};

export function maskPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 6) return raw;
  const first = digits.slice(0, 3);
  const mid = digits.slice(3, 5);
  const lastTwo = digits.slice(-2);
  return `+${first} ${mid}•• ••${lastTwo}`;
}

export function formatPaymentLabel(m: PaymentMethod): string {
  return `${GATEWAY_LABEL[m.gateway]} · ${maskPhone(m.phone)}`;
}
