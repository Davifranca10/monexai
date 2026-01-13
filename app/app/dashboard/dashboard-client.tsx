'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InfoBox } from '@/components/ui/info-box';
import { formatCurrency, formatDate, FREEMIUM_LIMITS, PRO_LIMITS } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Repeat,
  Plus,
  ArrowRight,
  Crown,
  AlertTriangle,
  Calendar,
  Lock,
  Info,
} from 'lucide-react';
type UserMode = 'PERSONAL' | 'BUSINESS';
type TransactionType = 'INCOME' | 'EXPENSE';
import dynamic from 'next/dynamic';

const DashboardChart = dynamic(() => import('./dashboard-chart'), { ssr: false });
const IncomeChart = dynamic(() => import('./income-chart'), { ssr: false });
const MonthlyEvolutionChart = dynamic(() => import('./monthly-evolution-chart'), { ssr: false });

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

interface DashboardClientProps {
  income: number;
  expenses: number;
  balance: number;
  categoryData: { name: string; total: number }[];
  incomeCategoryData: { name: string; total: number }[];
  monthlyData: { month: string; monthValue: string; income: number; expenses: number }[];
  recentTransactions: Transaction[];
  allTransactions: Transaction[];
  recurrencesCount: number;
  isPro: boolean;
  mode: UserMode;
  transactionCount: number;
}

export function DashboardClient({
  income,
  expenses,
  balance,
  categoryData,
  incomeCategoryData,
  monthlyData,
  recentTransactions,
  allTransactions,
  recurrencesCount,
  isPro,
  mode,
  transactionCount,
}: DashboardClientProps) {
  const [filter, setFilter] = useState('current');

  const nearLimit = !isPro && transactionCount >= FREEMIUM_LIMITS.transactionsPerMonth * 0.8;
  const atLimit = !isPro && transactionCount >= FREEMIUM_LIMITS.transactionsPerMonth;

  // Filter transactions for display (last 30 days only for recent)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last30DaysTransactions = recentTransactions.filter((t) => new Date(t.date) >= thirtyDaysAgo);

  // Filter data based on selected period
  const getFilteredData = () => {
    switch (filter) {
      case 'current':
        // Primeiro e último dia do mês atual
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        return allTransactions.filter((t) => {
          const transactionDate = new Date(t.date);
          return transactionDate >= startOfMonth && transactionDate <= endOfMonth;
        });
      case 'last7':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return allTransactions.filter((t) => new Date(t.date) >= sevenDaysAgo);
      case 'last30':
        return allTransactions.filter((t) => new Date(t.date) >= thirtyDaysAgo);
      case 'last3months':
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return allTransactions.filter((t) => new Date(t.date) >= threeMonthsAgo);
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return allTransactions.filter((t) => new Date(t.date) >= startOfYear);
      default:
        return allTransactions;
    }
  };

  const filteredTransactions = getFilteredData();
  const filteredIncome = filteredTransactions.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const filteredExpenses = filteredTransactions.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const filteredBalance = filteredIncome - filteredExpenses;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600 text-sm md:text-base">Visão geral das suas finanças</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Mês Atual</SelectItem>
              <SelectItem value="last7">Últimos 7 dias</SelectItem>
              <SelectItem value="last30">Últimos 30 dias</SelectItem>
              <SelectItem value="last3months">Últimos 3 meses</SelectItem>
              <SelectItem value="year">Visão anual</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/app/lancamentos/novo">
            <Button className="bg-green-700 hover:bg-green-800">
              <Plus className="h-4 w-4 mr-2" /> Novo
            </Button>
          </Link>
        </div>
      </div>

      <InfoBox
        title="Bem-vindo ao seu Dashboard Financeiro!"
        description="Aqui você acompanha receitas, despesas e saldo de forma simples. Os gráficos mostram para onde seu dinheiro está indo."
        tutorial={[
          'Use os filtros acima para ver períodos diferentes',
          'Os cards mostram o resumo do período selecionado',
          'Use os gráficos para identificar onde gasta mais'
        ]}
      />

      {/* Plan Status Banner */}
      {!isPro && (
        <Card className="mb-6 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-4">
            <div className="flex items-center gap-2 flex-1">
              <Info className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-800">Plano Freemium</p>
                <p className="text-sm text-gray-600">
                  {transactionCount}/{FREEMIUM_LIMITS.transactionsPerMonth} lançamentos • Histórico limitado a {FREEMIUM_LIMITS.historyMonths} meses
                </p>
              </div>
            </div>
            <Link href="/app/assinatura">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Crown className="h-4 w-4 mr-1" /> Ver plano Pro
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Freemium Alert */}
      {nearLimit && !atLimit && (
        <Card className="mb-6 border-amber-300 bg-amber-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <p className="flex-1 text-amber-800">
              Você usou {transactionCount}/{FREEMIUM_LIMITS.transactionsPerMonth} lançamentos.
            </p>
            <Link href="/app/assinatura">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                <Crown className="h-4 w-4 mr-1" /> Upgrade
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {atLimit && (
        <Card className="mb-6 border-red-300 bg-red-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="flex-1 text-red-800">
              Limite de lançamentos atingido!
            </p>
            <Link href="/app/assinatura">
              <Button size="sm" variant="destructive">
                <Crown className="h-4 w-4 mr-1" /> Upgrade
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <Card>
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="flex items-center gap-1 md:gap-2">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              <span className="text-lg md:text-2xl font-bold text-green-600">
                {formatCurrency(filteredIncome)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
              Despesas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="flex items-center gap-1 md:gap-2">
              <TrendingDown className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
              <span className="text-lg md:text-2xl font-bold text-red-600">
                {formatCurrency(filteredExpenses)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="flex items-center gap-1 md:gap-2">
              <Wallet className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              <span className={`text-lg md:text-2xl font-bold ${filteredBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(filteredBalance)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
              Recorrências
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="flex items-center gap-1 md:gap-2">
              <Repeat className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
              <span className="text-lg md:text-2xl font-bold text-purple-600">
                {recurrencesCount} ativas
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Category charts first, then Monthly Evolution */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm md:text-base">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-[220px] md:h-[250px]">
            {categoryData.length > 0 ? (
              <DashboardChart data={categoryData} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Sem despesas no período
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm md:text-base">Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-[220px] md:h-[250px]">
            {incomeCategoryData.length > 0 ? (
              <IncomeChart data={incomeCategoryData} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Sem receitas no período
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Evolution Chart - Below category charts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-sm md:text-base">Evolução Mensal</span>
            {!isPro && (
              <Badge variant="outline" className="text-xs">
                <Lock className="h-3 w-3 mr-1" /> Visão completa no Pro
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] md:h-[300px]">
          <MonthlyEvolutionChart data={monthlyData} />
        </CardContent>
      </Card>

      {/* Recent Transactions - Last 30 days only */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm md:text-base">Últimos Lançamentos</CardTitle>
            <p className="text-xs text-gray-500 mt-1">Mostrando apenas os últimos 30 dias</p>
          </div>
          <Link href="/app/lancamentos">
            <Button variant="ghost" size="sm">
              Ver todos <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {last30DaysTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wallet className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>Nenhum lançamento nos últimos 30 dias</p>
              <Link href="/app/lancamentos/novo">
                <Button className="mt-4 bg-green-700 hover:bg-green-800" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Criar lançamento
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {last30DaysTransactions.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <div className={`p-1.5 md:p-2 rounded-full flex-shrink-0 ${
                      t.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {t.type === 'INCOME' ? (
                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-xs md:text-sm truncate">{t.description}</p>
                      <p className="text-[10px] md:text-xs text-gray-500">
                        {t.category} • {formatDate(t.date)}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold text-xs md:text-sm flex-shrink-0 ${
                    t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pro Feature Highlight */}
      {!isPro && (
        <Card className="mt-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                  <Crown className="h-5 w-5" /> Desbloqueie o MonexAI Pro
                </h3>
                <p className="text-emerald-700 text-sm mt-1">
                  Acesse histórico detalhado de 5 meses, lançamentos ilimitados, Chat IA financeiro, Central Educacional e muito mais.
                </p>
              </div>
              <Link href="/app/assinatura">
                <Button className="bg-emerald-700 hover:bg-emerald-800">
                  Conhecer o Pro <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
