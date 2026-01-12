'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, FREEMIUM_LIMITS, PRO_LIMITS } from '@/lib/utils';
import { InfoBox } from '@/components/ui/info-box';
import {
  Plus,
  Search,
  Trash2,
  TrendingUp,
  TrendingDown,
  Filter,
  Lock,
  Crown,
  Info,
  Calendar,
} from 'lucide-react';
import { TransactionType, UserMode } from '@prisma/client';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Transaction {
  id: string;
  description: string;
  amountCents: number;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  categoryType: TransactionType;
  date: string;
  interestPercent: number;
  installments: number;
}

interface LancamentosClientProps {
  transactions: Transaction[];
  categories: { id: string; name: string; type: TransactionType }[];
  isPro: boolean;
  mode: UserMode;
}

// Helper to generate month options for select
function generateMonthOptions(isPro: boolean) {
  const options = [];
  const now = new Date();
  const maxMonths = isPro ? 6 : 2; // Free: current + 1 previous, Pro: 6 months

  for (let i = 0; i < maxMonths; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    options.push({ value, label });
  }

  return options;
}

export function LancamentosClient({
  transactions: initialTransactions,
  categories,
  isPro,
  mode,
}: LancamentosClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get current month as default
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Check if there's a month parameter from URL (from graph click)
  const urlMonth = searchParams?.get('month');
  
  const [transactions, setTransactions] = useState(initialTransactions);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>(urlMonth || currentMonth);
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);

  const monthOptions = generateMonthOptions(isPro);
  const allowedMonths = monthOptions.map(m => m.value);

  // Validate URL month parameter
  useEffect(() => {
    if (urlMonth && !allowedMonths.includes(urlMonth)) {
      // Month not allowed for this plan
      setShowUpgradeMessage(true);
      setMonthFilter(currentMonth);
      // Clean URL
      router.replace('/app/lancamentos');
    }
  }, [urlMonth, allowedMonths, currentMonth, router]);

  // Filter transactions by month
  const filtered = transactions.filter((t) => {
    const transactionDate = new Date(t?.date || '');
    const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
    
    const matchMonth = transactionMonth === monthFilter;
    const matchSearch = t?.description?.toLowerCase()?.includes(search?.toLowerCase() ?? '') ?? true;
    const matchType = typeFilter === 'all' || t?.type === typeFilter;
    const matchCategory = categoryFilter === 'all' || t?.categoryId === categoryFilter;
    
    return matchMonth && matchSearch && matchType && matchCategory;
  });

  // Filter categories based on type filter
  const filteredCategories = categories.filter((c) => {
    if (typeFilter === 'all') return true;
    return c.type === typeFilter;
  });

  // Remove duplicates (safety check)
  const uniqueCategories = Array.from(
    new Map(filteredCategories.map(c => [c.id, c])).values()
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este lançamento?')) return;

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => t?.id !== id));
        toast.success('Lançamento excluído');
      } else {
        toast.error('Erro ao excluir');
      }
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const handleMonthChange = (value: string) => {
    if (!allowedMonths.includes(value)) {
      setShowUpgradeMessage(true);
      return;
    }
    setMonthFilter(value);
    setShowUpgradeMessage(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Lançamentos</h1>
          <p className="text-gray-600 text-sm md:text-base">Gerencie suas receitas e despesas</p>
        </div>
        <Link href="/app/lancamentos/novo">
          <Button className="bg-green-700 hover:bg-green-800 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" /> Novo Lançamento
          </Button>
        </Link>
      </div>

      <InfoBox
        title="O que são lançamentos?"
        description="Lançamentos são as suas movimentações financeiras: receitas (dinheiro que entra) e despesas (dinheiro que sai). Registre tudo para ter controle total das suas finanças."
        tutorial={[
          'Clique em "Novo Lançamento" para registrar',
          'Escolha se é receita ou despesa',
          'Selecione um template ou preencha manualmente',
          'Use os filtros para encontrar lançamentos específicos',
          'Filtre por mês para ver histórico detalhado'
        ]}
      />

      {/* Upgrade Message */}
      {showUpgradeMessage && (
        <Card className="mb-6 border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-4">
            <div className="flex items-center gap-2 flex-1">
              <Lock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Acesso Restrito</p>
                <p className="text-sm text-yellow-700">
                  Para visualizar lançamentos de meses anteriores, é necessário ser usuário Pro.
                </p>
              </div>
            </div>
            <Link href="/app/assinatura">
              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                <Crown className="h-4 w-4 mr-1" /> Fazer Upgrade
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Plan Info Banner */}
      {!isPro && !showUpgradeMessage && (
        <Card className="mb-6 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-4">
            <div className="flex items-center gap-2 flex-1">
              <Info className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-800">Plano Freemium</p>
                <p className="text-sm text-gray-600">
                  Você pode visualizar lançamentos do mês atual e do mês anterior.
                  Faça upgrade para acessar até 6 meses de histórico.
                </p>
              </div>
            </div>
            <Link href="/app/assinatura">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Crown className="h-4 w-4 mr-1" /> Ver Pro
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex flex-col gap-3 md:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar lançamentos..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Month Filter */}
              <Select value={monthFilter} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={(value) => {
                setTypeFilter(value);
                setCategoryFilter('all'); // Reset category when type changes
              }}>
                <SelectTrigger className="w-full sm:w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="INCOME">Receitas</SelectItem>
                  <SelectItem value="EXPENSE">Despesas</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {uniqueCategories?.map((c) => (
                    <SelectItem key={c?.id} value={c?.id ?? ''}>
                      {c?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">{filtered?.length ?? 0} lançamentos</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          {(filtered?.length ?? 0) > 0 ? (
            <div className="space-y-2">
              {filtered.map((t) => (
                <div
                  key={t?.id}
                  className="flex items-center justify-between p-3 md:p-4 rounded-lg transition-colors bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                    <div
                      className={`p-2 rounded-full flex-shrink-0 ${
                        t?.type === 'INCOME'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {t?.type === 'INCOME' ? (
                        <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                      ) : (
                        <TrendingDown className="h-4 w-4 md:h-5 md:w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm md:text-base truncate">{t?.description}</p>
                      <div className="flex flex-wrap items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-500">
                        <Badge variant="secondary" className="text-xs">
                          {t?.categoryName}
                        </Badge>
                        <span>{formatDate(t?.date ?? '')}</span>
                        {(t?.installments ?? 1) > 1 && (
                          <Badge variant="outline" className="text-xs">
                            {t?.installments}x
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                    <span
                      className={`text-sm md:text-lg font-semibold ${
                        t?.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {t?.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(t?.amountCents ?? 0)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                      onClick={() => handleDelete(t?.id ?? '')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nenhum lançamento encontrado para este período
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
