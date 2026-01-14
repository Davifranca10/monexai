import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DashboardClient } from './dashboard-client';

// ✅ Cache de 30 segundos em vez de force-dynamic
export const revalidate = 30;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const yearStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // ✅ OTIMIZAÇÃO 1: Buscar TODAS as transações de uma vez (últimos 12 meses)
  // Em vez de fazer 7+ queries separadas, fazemos apenas 1
  const [allTransactionsData, recurrencesCount, subscription, profile] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: yearStart },
      },
      include: { category: true },
      orderBy: { date: 'desc' },
    }),
    prisma.recurringRule.count({
      where: { userId, isActive: true },
    }),
    prisma.subscription.findUnique({
      where: { userId },
    }),
    prisma.userProfile.findUnique({
      where: { userId },
    }),
  ]);

  // ✅ OTIMIZAÇÃO 2: Processar tudo em memória (muito mais rápido que queries)
  
  // Transações do mês atual
  const currentMonthTransactions = allTransactionsData.filter(
    t => t.date >= startOfMonth && t.date <= endOfMonth
  );

  // Calcular totais do mês
  const income = currentMonthTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amountCents, 0);

  const expenses = currentMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amountCents, 0);

  const balance = income - expenses;

  // Gastos por categoria (EXPENSES)
  const categoryTotals: Record<string, { name: string; total: number }> = {};
  currentMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .forEach(t => {
      const catName = t.category?.name || 'Outros';
      if (!categoryTotals[catName]) {
        categoryTotals[catName] = { name: catName, total: 0 };
      }
      categoryTotals[catName].total += t.amountCents;
    });

  const categoryData = Object.values(categoryTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Receitas por categoria (INCOME)
  const incomeCategoryTotals: Record<string, { name: string; total: number }> = {};
  currentMonthTransactions
    .filter(t => t.type === 'INCOME')
    .forEach(t => {
      const catName = t.category?.name || 'Outros';
      if (!incomeCategoryTotals[catName]) {
        incomeCategoryTotals[catName] = { name: catName, total: 0 };
      }
      incomeCategoryTotals[catName].total += t.amountCents;
    });

  const incomeCategoryData = Object.values(incomeCategoryTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // ✅ OTIMIZAÇÃO 3: Evolução mensal SEM queries adicionais
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthlyData: { month: string; monthValue: string; income: number; expenses: number }[] = [];
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

    // Filtrar transações do mês em memória (sem query!)
    const monthTransactions = allTransactionsData.filter(
      t => t.date >= monthStart && t.date <= monthEnd
    );

    const monthIncome = monthTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amountCents, 0);

    const monthExpenses = monthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amountCents, 0);

    const monthValue = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

    monthlyData.push({
      month: monthNames[monthDate.getMonth()],
      monthValue,
      income: monthIncome,
      expenses: monthExpenses,
    });
  }

  // Preparar todas as transações para filtros
  const allTransactions = allTransactionsData.map(t => ({
    id: t.id,
    description: t.description,
    amount: t.amountCents,
    type: t.type,
    category: t.category?.name || 'Outros',
    date: t.date.toISOString(),
  }));

  // Transações recentes (últimos 30 dias)
  const recentTransactions = allTransactionsData
    .filter(t => t.date >= thirtyDaysAgo)
    .slice(0, 10)
    .map(t => ({
      id: t.id,
      description: t.description,
      amount: t.amountCents,
      type: t.type,
      category: t.category?.name || 'Outros',
      date: t.date.toISOString(),
    }));

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
      transactionCount={currentMonthTransactions.length}
    />
  );
}