import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signupLimiter, getClientIp } from '@/lib/rate-limiter';
import { sendVerificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 3 signup attempts per hour per IP (prevents spam/abuse)
    const clientIp = getClientIp(request.headers);
    const rateLimitResult = signupLimiter.isAllowed(clientIp);

    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Limite de cadastros excedido. Tente novamente em uma hora.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Current': rateLimitResult.current.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { email, password, name } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        name: name || null,
        passwordHash,
        emailVerified: null, // Usuário precisa verificar o email
        subscription: {
          create: {
            status: 'FREEMIUM',
          },
        },
      },
    });

    // TODO: Implementar envio de email de verificação
    // Sugestão: Usar Resend (https://resend.com) ou SendGrid
    // Criar token de verificação e enviar link para o email do usuário

    const verificationToken = crypto.randomUUID();

    // Salvar no banco
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      },
    });

    // Enviar email
    await sendVerificationEmail(email, verificationToken);
    
    return NextResponse.json({
      success: true,
      userId: user.id,
      message: 'Conta criada! Verifique seu email para ativar a conta (funcionalidade em implementação).'
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    );
  }
}
