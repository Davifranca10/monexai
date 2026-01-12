import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserMode } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { mode } = body ?? {};

    if (!mode || !['PERSONAL', 'BUSINESS'].includes(mode)) {
      return NextResponse.json(
        { error: 'Modo inválido' },
        { status: 400 }
      );
    }

    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Perfil já configurado' },
        { status: 400 }
      );
    }

    await prisma.userProfile.create({
      data: {
        userId: session.user.id,
        mode: mode as UserMode,
      },
    });

    return NextResponse.json({ success: true, mode });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Erro ao configurar perfil' },
      { status: 500 }
    );
  }
}
