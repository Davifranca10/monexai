// BEM NO TOPO DO ARQUIVO, antes de qualquer import
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 APPLICATION STARTING');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  hasDatabase: !!process.env.DATABASE_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
});
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'sonner';

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

// Tratamento seguro da URL base
const getMetadataBase = () => {
  const url = process.env.NEXTAUTH_URL || 'https://monexai-production.up.railway.app';
  try {
    return new URL(url);
  } catch (error) {
    console.error('❌ Error parsing NEXTAUTH_URL:', error);
    return new URL('https://monexai-production.up.railway.app');
  }
};

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: 'MonexAI - Gestão Financeira Inteligente',
  description: 'Controle suas finanças de forma simples e inteligente com IA',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'MonexAI - Gestão Financeira Inteligente',
    description: 'Controle suas finanças de forma simples e inteligente com IA',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}