import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Endpoint para verificação de email
 * 
 * Recebe um token de verificação e ativa a conta do usuário
 * URL: /api/auth/verify-email?token=TOKEN
 */
export async function GET(request: NextRequest) {
  // Usar NEXTAUTH_URL para evitar redirecionamento para localhost em produção
  const baseUrl = process.env.NEXTAUTH_URL || 'https://monexai-production.up.railway.app';
  
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      // Redirecionar para login com erro
      const redirectUrl = new URL('/login', baseUrl);
      redirectUrl.searchParams.set('error', 'token_invalido');
      return NextResponse.redirect(redirectUrl);
    }

    // Buscar token no banco de dados
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    // Verificar se token existe e não expirou
    if (!verificationToken) {
      const redirectUrl = new URL('/login', baseUrl);
      redirectUrl.searchParams.set('error', 'token_invalido');
      return NextResponse.redirect(redirectUrl);
    }

    if (verificationToken.expires < new Date()) {
      // Token expirado - deletar e informar usuário
      await prisma.verificationToken.delete({
        where: { token },
      });
      
      const redirectUrl = new URL('/login', baseUrl);
      redirectUrl.searchParams.set('error', 'token_expirado');
      return NextResponse.redirect(redirectUrl);
    }

    // Ativar usuário
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Deletar token usado
    await prisma.verificationToken.delete({
      where: { token },
    });

    // Redirecionar para login com sucesso
    const redirectUrl = new URL('/login', baseUrl);
    redirectUrl.searchParams.set('success', 'email_verificado');
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Verify email error:', error);
    const redirectUrl = new URL('/login', baseUrl);
    redirectUrl.searchParams.set('error', 'erro_verificacao');
    return NextResponse.redirect(redirectUrl);
  }
}
