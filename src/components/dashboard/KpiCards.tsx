import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';

export function KpiCards() {
  const { transactions, sinkingFunds, assets, debts, settings, selectedMonth, selectedYear } = useFinanceStore();

  // Current Month calculations
  const currentMonth = selectedMonth;
  const currentYear = selectedYear;

  const currentMonthTxs = transactions.filter(t => {
    const d = new Date(t.data);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const entrateMese = currentMonthTxs
    .filter(t => t.tipo === 'Entrata')
    .reduce((acc, t) => acc + t.importo, 0);

  const usciteMese = currentMonthTxs
    .filter(t => t.tipo === 'Spesa')
    .reduce((acc, t) => acc + t.importo, 0);

  const risparmioMese = entrateMese - usciteMese;

  // Net Worth Calculation
  const totaleSinkingFunds = sinkingFunds.reduce((acc, f) => acc + f.risparmioMensile - f.spese, 0);
  const totaleInvestimenti = assets.reduce((acc, a) => acc + (a.quantita * a.prezzoAttuale), 0);
  const totaleDebiti = debts.reduce((acc, d) => acc + (d.valoreDebitoIniziale - d.totalePagato), 0);
  
  const netWorth = settings.liquiditaIniziale + totaleSinkingFunds + totaleInvestimenti - totaleDebiti;

  const kpis = [
    {
      title: 'Net Worth',
      value: `€${netWorth.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
      icon: Wallet,
      trend: '+12.5%',
      trendUp: true,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50'
    },
    {
      title: 'Entrate (Mese)',
      value: `€${entrateMese.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
      icon: ArrowUpRight,
      trend: '+2.1%',
      trendUp: true,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Uscite (Mese)',
      value: `€${usciteMese.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
      icon: ArrowDownRight,
      trend: '-5.4%',
      trendUp: false,
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    },
    {
      title: 'Risparmio (Mese)',
      value: `€${risparmioMese.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      trend: '+15.2%',
      trendUp: true,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card key={idx} className="group hover:border-blue-200 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${kpi.bg}`}>
                  <Icon size={24} className={kpi.color} />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${kpi.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <span>{kpi.trend}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
