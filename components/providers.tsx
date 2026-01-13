'use client';

import { SessionProvider } from 'next-auth/react';
import { useState, useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  // TEMPORARIAMENTE SEM SESSION PROVIDER PARA TESTAR
  return <>{children}</>;
  
  // Depois que funcionar, volte para:
  // return <SessionProvider>{children}</SessionProvider>;
}