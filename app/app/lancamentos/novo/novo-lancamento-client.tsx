'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, calculateInterest } from '@/lib/utils';
type TransactionType = 'INCOME' | 'EXPENSE';
type UserMode = 'PERSONAL' | 'BUSINESS';
import { toast } from 'sonner';
import { Loader2, TrendingUp, TrendingDown, Percent } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  amountCents: number | null;
}

interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

interface NovoLancamentoClientProps {
  categories: Category[];
  templates: Template[];
  mode: UserMode;
}

export function NovoLancamentoClient({
  categories,
  templates,
  mode,
}: NovoLancamentoClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [installments, setInstallments] = useState('1');
  const [interestPercent, setInterestPercent] = useState('0');
  const [showInterest, setShowInterest] = useState(false);

  const amountCents = Math.round(parseFloat(amount || '0') * 100);
  const interestCalc = calculateInterest(
    amountCents,
    parseFloat(interestPercent || '0'),
    parseInt(installments || '1')
  );

  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find((t) => t?.id === templateId);
    if (template) {
      setType(template.type);
      setCategoryId(template.categoryId);
      setDescription(template.name);
      if (template.amountCents) {
        setAmount((template.amountCents / 100).toFixed(2));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !description || !amount || !date) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          categoryId,
          description,
          amountCents,
          date,
          installments: parseInt(installments || '1'),
          interestPercent: parseFloat(interestPercent || '0'),
        }),
      });

      if (res.ok) {
        toast.success('Lançamento criado!');
        router.push('/app/lancamentos');
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data?.error || 'Erro ao criar lançamento');
      }
    } catch (error) {
      toast.error('Erro ao criar lançamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Novo Lançamento</h1>

      {/* Templates - filtrados pelo tipo selecionado */}
      {(templates?.filter((t) => t?.type === type)?.length ?? 0) > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">
              Usar Template de {type === 'INCOME' ? 'Receita' : 'Despesa'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {templates
                .filter((t) => t?.type === type)
                .map((t) => (
                  <Button
                    key={t?.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTemplateSelect(t?.id ?? '')}
                  >
                    {t?.type === 'INCOME' ? (
                      <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                    )}
                    {t?.name}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={type === 'EXPENSE' ? 'default' : 'outline'}
                className={type === 'EXPENSE' ? 'bg-red-600 hover:bg-red-700' : ''}
                onClick={() => { setType('EXPENSE'); setCategoryId(''); }}
              >
                <TrendingDown className="h-4 w-4 mr-2" /> Despesa
              </Button>
              <Button
                type="button"
                variant={type === 'INCOME' ? 'default' : 'outline'}
                className={type === 'INCOME' ? 'bg-green-600 hover:bg-green-700' : ''}
                onClick={() => { setType('INCOME'); setCategoryId(''); }}
              >
                <TrendingUp className="h-4 w-4 mr-2" /> Receita
              </Button>
            </div>

            {/* Category - filtrado pelo tipo selecionado */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    ?.filter((c) => c?.type === type)
                    ?.map((c) => (
                      <SelectItem key={c?.id} value={c?.id ?? ''}>
                        {c?.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreva o lançamento"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Installments (Business mode with income) */}
            {mode === 'BUSINESS' && type === 'INCOME' && (
              <>
                <div className="space-y-2">
                  <Label>Parcelas</Label>
                  <Select value={installments} onValueChange={setInstallments}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}x
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showInterest"
                    checked={showInterest}
                    onChange={(e) => setShowInterest(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="showInterest">Calcular com juros?</Label>
                </div>

                {showInterest && (
                  <div className="space-y-2">
                    <Label>Taxa de Juros (% ao mês)</Label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0"
                        className="pl-10"
                        value={interestPercent}
                        onChange={(e) => setInterestPercent(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {showInterest && parseFloat(interestPercent || '0') > 0 && (
                  <Card className="bg-gray-50">
                    <CardContent className="pt-4 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Valor base:</span>
                        <span>{formatCurrency(amountCents)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total de juros:</span>
                        <span className="text-amber-600">
                          {formatCurrency(interestCalc.totalInterest)}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total com juros:</span>
                        <span>{formatCurrency(interestCalc.totalWithInterest)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Valor por parcela:</span>
                        <span>{formatCurrency(interestCalc.installmentValue)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
              ) : (
                'Salvar Lançamento'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
