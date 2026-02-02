import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

//rate limit here is not working
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // 🌍 Get real client IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown';

    // 🔒 Rate limit check (IP + Email combo)
    const emailKey = email.toLowerCase();
    const ipKey = ip;

    // 1️⃣ Per-IP flood protection
    const ipAllowed = await rateLimit(`login:ip:${ipKey}`, 100, 60);
    if (!ipAllowed) {
      return NextResponse.json({ error: 'Muitas tentativas.' }, { status: 429 });
    }

    // 🔍 Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true, subscription: true },
    });

    // ❌ Do NOT reveal if email exists
    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

if (!isValid) {
  const failAllowed = await rateLimit(`login:fail:${emailKey}`, 5, 300);

  if (!failAllowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Conta temporariamente bloqueada.' },
      { status: 429 }
    );
  }

  return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
}
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}
