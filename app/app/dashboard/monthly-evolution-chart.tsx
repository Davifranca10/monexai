'use client';

import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface MonthlyEvolutionChartProps {
  data: { month: string; monthValue: string; income: number; expenses: number }[];
}

export default function MonthlyEvolutionChart({ data }: MonthlyEvolutionChartProps) {
  const router = useRouter();

  const handleBarClick = (data: any) => {
    if (data?.monthValue) {
      // Redirect to lancamentos with month filter
      router.push(`/app/lancamentos?month=${data.monthValue}`);
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data} 
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        onClick={handleBarClick}
        style={{ cursor: 'pointer' }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 11 }} 
          tickLine={false}
        />
        <YAxis 
          tick={{ fontSize: 11 }} 
          tickLine={false}
          tickFormatter={(value) => `${(value / 100).toFixed(0)}`}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{ fontSize: '12px' }}
          labelStyle={{ fontWeight: 'bold' }}
          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px' }}
        />
        <Bar 
          dataKey="income" 
          name="Receitas" 
          fill="#22c55e" 
          radius={[4, 4, 0, 0]}
          onClick={handleBarClick}
          style={{ cursor: 'pointer' }}
        />
        <Bar 
          dataKey="expenses" 
          name="Despesas" 
          fill="#ef4444" 
          radius={[4, 4, 0, 0]}
          onClick={handleBarClick}
          style={{ cursor: 'pointer' }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
