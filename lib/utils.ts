import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

export function calculateInterest(amountCents: number, interestPercent: number, installments: number): {
  totalWithInterest: number;
  totalInterest: number;
  installmentValue: number;
} {
  const interest = (amountCents * interestPercent * installments) / 100;
  const totalWithInterest = amountCents + interest;
  return {
    totalWithInterest: Math.round(totalWithInterest),
    totalInterest: Math.round(interest),
    installmentValue: Math.round(totalWithInterest / installments),
  };
}

// FREEMIUM limits
export const FREEMIUM_LIMITS = {
  transactionsPerMonth: 12,
  historyMonths: 3, // mês atual + 2 meses para trás (detalhado)
  maxRecurrences: 3,
};

// PRO limits
export const PRO_LIMITS = {
  detailedHistoryMonths: 5, // últimos 5 meses com detalhes completos
};
