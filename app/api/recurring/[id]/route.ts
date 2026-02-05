import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;  

    const body = await request.json();

    // ✅ SECURITY: Verify ownership before updating
    const rule = await prisma.recurring_rule.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!rule) {
      return NextResponse.json({ error: 'Recorrência não encontrada' }, { status: 404 });
    }

    // ✅ SECURITY: Whitelist allowed fields to prevent mass assignment
    const { description, amountCents, dayOfMonth, dayOfWeek, endDate, isActive } = body;

    const updated = await prisma.recurring_rule.update({
      where: { id },
      data: {
        ...(description !== undefined && { description }),
        ...(amountCents !== undefined && { amountCents }),
        ...(dayOfMonth !== undefined && { dayOfMonth }),
        ...(dayOfWeek !== undefined && { dayOfWeek }),
        ...(endDate !== undefined && { endDate }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating recurring rule:', error);
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ← MUDANÇA AQUI
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;  // ← MUDANÇA AQUI

    // Verify ownership
    const rule = await prisma.recurring_rule.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!rule) {
      return NextResponse.json({ error: 'Recorrência não encontrada' }, { status: 404 });
    }

    await prisma.recurring_rule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recurring rule:', error);
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  }
}