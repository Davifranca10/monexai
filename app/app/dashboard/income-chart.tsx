'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d', '#84cc16', '#65a30d'];

interface IncomeChartProps {
  data: { name: string; total: number }[];
}

export default function IncomeChart({ data }: IncomeChartProps) {
  const chartData = data.map((item) => ({
    name: item.name,
    value: item.total,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{ fontSize: '12px' }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px' }}
          layout="horizontal"
          verticalAlign="bottom"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
