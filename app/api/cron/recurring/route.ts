import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Idempotent daily job to process recurring rules
export async function POST(request: NextRequest) {
  try {
    // Optional: Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow without secret for dev, but log warning
      console.warn('Cron called without valid secret');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayOfMonth = today.getDate();
    const dayOfWeek = today.getDay();

    // Get all active rules that should run today
    const rules = await prisma.recurring_rule.findMany({
      where: {
        isActive: true,
        OR: [
          // Monthly rules matching today's day
          { type: 'MONTHLY', dayOfMonth },
          // Weekly rules matching today's day of week
          { type: 'WEEKLY', dayOfWeek },
          // Installment rules (process monthly on same day as start)
          {
            type: 'INSTALLMENT',
            startDate: {
              lte: today,
            },
          },
        ],
      },
      include: { user: { include: { subscription: true } } },
    });

    let created = 0;
    let skipped = 0;

    for (const rule of rules) {
      // For installments, check if we should process today
      if (rule.type === 'INSTALLMENT') {
        const startDay = rule.startDate.getDate();
        if (startDay !== dayOfMonth) {
          continue; // Not the right day for this installment
        }

        // Check if all installments paid
        if ((rule.paidInstallments ?? 0) >= (rule.totalInstallments ?? 0)) {
          // Mark as inactive
          await prisma.recurring_rule.update({
            where: { id: rule.id },
            data: { isActive: false },
          });
          continue;
        }
      }

      // Check idempotency - has this rule already run today?
      const existingRun = await prisma.recurring_run.findUnique({
        where: {
          recurringRuleId_executionDate: {
            recurringRuleId: rule.id,
            executionDate: today,
          },
        },
      });

      if (existingRun) {
        skipped++;
        continue; // Already processed today
      }

      // Create the transaction
      const transaction = await prisma.transaction.create({
        data: {
          id: crypto.randomUUID(),
          userId: rule.userId,
          type: rule.transactionType,
          categoryId: rule.categoryId,
          description: rule.description,
          amountCents: rule.amountCents,
          date: today,
          recurringRuleId: rule.id,
        },
      });

      // Record the run for idempotency
      await prisma.recurring_run.create({
        data: {
          id: crypto.randomUUID(),
          recurringRuleId: rule.id,
          executionDate: today,
          transactionId: transaction.id,
        },
      });

      // For installments, increment paid count
      if (rule.type === 'INSTALLMENT') {
        await prisma.recurring_rule.update({
          where: { id: rule.id },
          data: {
            paidInstallments: { increment: 1 },
          },
        });
      }

      created++;
    }

    return NextResponse.json({
      success: true,
      processed: rules.length,
      created,
      skipped,
      date: today.toISOString(),
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Erro no processamento' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Redirect GET to POST for easier testing
  return POST(request);
}
