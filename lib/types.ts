import { UserMode, TransactionType, RecurrenceType, SubscriptionStatus } from '@prisma/client';

export type { UserMode, TransactionType, RecurrenceType, SubscriptionStatus };

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
