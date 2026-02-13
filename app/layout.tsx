import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'sonner';
import Script from 'next/script';

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Microsoft Clarity - Movido para o HEAD */}
        <Script
          id="microsoft-clarity"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "vgqycmmnni");
            `,
          }}
        />
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