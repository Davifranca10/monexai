import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { DashboardClient } from './dashboard-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Get transactions for current month
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: { category: true },
    orderBy: { date: 'desc' },
  });

  // Calculate totals
  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amountCents, 0);

  const expenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amountCents, 0);

  const balance = income - expenses;

  // Get spending by category (EXPENSES)
  const categoryTotals: Record<string, { name: string; total: number }> = {};
  transactions
    .filter((t) => t.type === 'EXPENSE')
    .forEach((t) => {
      const catName = t.category?.name || 'Outros';
      if (!categoryTotals[catName]) {
        categoryTotals[catName] = { name: catName, total: 0 };
      }
      categoryTotals[catName].total += t.amountCents;
    });

  const categoryData = Object.values(categoryTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Get income by category (INCOME)
  const incomeCategoryTotals: Record<string, { name: string; total: number }> = {};
  transactions
    .filter((t) => t.type === 'INCOME')
    .forEach((t) => {
      const catName = t.category?.name || 'Outros';
      if (!incomeCategoryTotals[catName]) {
        incomeCategoryTotals[catName] = { name: catName, total: 0 };
      }
      incomeCategoryTotals[catName].total += t.amountCents;
    });

  const incomeCategoryData = Object.values(incomeCategoryTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Get monthly evolution data (last 6 months)
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthlyData: { month: string; monthValue: string; income: number; expenses: number }[] = [];
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

    const monthTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: monthStart, lte: monthEnd },
      },
    });

    const monthIncome = monthTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amountCents, 0);

    const monthExpenses = monthTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amountCents, 0);

    // Format monthValue as YYYY-MM for URL parameter
    const monthValue = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

    monthlyData.push({
      month: monthNames[monthDate.getMonth()],
      monthValue,
      income: monthIncome,
      expenses: monthExpenses,
    });
  }

  // Get all transactions for filtering (last 12 months)
  const yearStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const allTransactionsData = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: yearStart },
    },
    include: { category: true },
    orderBy: { date: 'desc' },
  });

  const allTransactions = allTransactionsData.map((t) => ({
    id: t.id,
    description: t.description,
    amount: t.amountCents,
    type: t.type,
    category: t.category?.name || 'Outros',
    date: t.date.toISOString(),
  }));

  // Get recent transactions (last 30 days only)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentTransactions = transactions
    .filter((t) => t.date >= thirtyDaysAgo)
    .slice(0, 10)
    .map((t) => ({
      id: t.id,
      description: t.description,
      amount: t.amountCents,
      type: t.type,
      category: t.category?.name || 'Outros',
      date: t.date.toISOString(),
    }));

  // Get active recurrences count
  const recurrencesCount = await prisma.recurringRule.count({
    where: { userId, isActive: true },
  });

  // Get subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  return (
    <DashboardClient
      income={income}
      expenses={expenses}
      balance={balance}
      categoryData={categoryData}
      incomeCategoryData={incomeCategoryData}
      monthlyData={monthlyData}
      recentTransactions={recentTransactions}
      allTransactions={allTransactions}
      recurrencesCount={recurrencesCount}
      isPro={subscription?.status === 'ACTIVE'}
      mode={profile?.mode || 'PERSONAL'}
      transactionCount={transactions.length}
    />
  );
}
