import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useFinanceStore } from '@/store/useFinanceStore';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell } from 'recharts';

export function BudgetChart() {
  const { transactions, settings, selectedMonth, selectedYear } = useFinanceStore();

  const currentMonth = selectedMonth;
  const currentYear = selectedYear;

  const usciteMese = transactions
    .filter(t => {
      const d = new Date(t.data);
      return t.tipo === 'Spesa' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, t) => acc + t.importo, 0);

  const budget = settings.budgetMensile;
  const percentage = Math.min((usciteMese / budget) * 100, 100);
  
  const data = [
    {
      name: 'Budget Mese',
      uscite: usciteMese,
      budget: budget
    }
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Avanzamento Budget</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center space-y-6">
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-rose-600">Speso: €{usciteMese.toFixed(2)}</span>
            <span className="text-slate-500">Budget: €{budget.toFixed(2)}</span>
          </div>
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${percentage > 90 ? 'bg-rose-600' : percentage > 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-right text-xs text-slate-500">{percentage.toFixed(1)}% utilizzato</p>
        </div>

        <div className="h-40 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis type="number" hide domain={[0, Math.max(budget, usciteMese)]} />
              <YAxis dataKey="name" type="category" hide />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                formatter={(value: any) => <span style={{color: '#0f172a'}}>{`€${Number(value).toFixed(2)}`}</span>}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
              />
              <ReferenceLine x={budget} stroke="#ef4444" strokeDasharray="3 3" />
              <Bar dataKey="uscite" radius={[0, 4, 4, 0]} barSize={32}>
                {
                  data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.uscite > budget ? '#ef4444' : '#0ea5e9'} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </CardContent>
    </Card>
  );
}
