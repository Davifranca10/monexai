import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Check if Pro
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (subscription?.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Recurso exclusivo do plano Pro' },
        { status: 403 }
      );
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    const body = await request.json();
    const { name, description, type, categoryId, amountCents } = body ?? {};

    if (!name || !type || !categoryId) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    const template = await prisma.template.create({
      data: {
        name,
        description: description || null,
        type,
        categoryId,
        mode: profile?.mode || 'PERSONAL',
        isSystem: false,
        userId: session.user.id,
        amountCents: amountCents || null,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Erro ao criar template' }, { status: 500 });
  }
}
