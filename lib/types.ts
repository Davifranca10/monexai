export type UserMode = 'PERSONAL' | 'BUSINESS';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type RecurrenceType = 'MONTHLY' | 'WEEKLY' | 'INSTALLMENT';
export type SubscriptionStatus = 'FREEMIUM' | 'ACTIVE' | 'CANCELED' | 'PAST_DUE';

export interface UserSession {
  id: string;
  email: string;
  name?: string | null;
  mode: UserMode | null;
  isPro: boolean;
}

declare module 'next-auth' {
  interface Session {
    user: UserSession;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    mode: UserMode | null;
    isPro: boolean;
  }
}
