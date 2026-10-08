import React from 'react';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { BudgetChart } from '@/components/dashboard/BudgetChart';
import { ExpenseDonut } from '@/components/dashboard/ExpenseDonut';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function DashboardPage() {
  const { transactions, settings, selectedMonth, selectedYear, setSelectedMonth } = useFinanceStore();

  const mesi = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const recentTransactions = [...transactions]
    .filter(t => {
      const d = new Date(t.data);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    })
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Panoramica</h2>
          <p className="text-slate-500 mt-1">Bentornato! Ecco il riepilogo delle tue finanze.</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-sky-500 focus:border-sky-500 block px-4 py-2.5 shadow-sm outline-none"
          >
            {mesi.map((mese, idx) => (
              <option key={idx} value={idx}>{mese}</option>
            ))}
          </select>
          <button className="flex items-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-sky-500/20">
            <Plus size={20} />
            <span className="hidden sm:inline">Nuova Transazione</span>
          </button>
        </div>
      </div>

      <KpiCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetChart />
        <ExpenseDonut />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ultimi Movimenti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg border-y border-l border-slate-100">Nome</th>
                  <th className="px-4 py-3 border-y border-slate-100">Categoria</th>
                  <th className="px-4 py-3 border-y border-slate-100">Data</th>
                  <th className="px-4 py-3 text-right rounded-r-lg border-y border-r border-slate-100">Importo</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => {
                  const category = settings.categorie.find(c => c.nome === tx.categoria);
                  const isPositive = tx.tipo === 'Entrata';
                  
                  return (
                    <tr key={tx.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-900">{tx.nome}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                          <span>{category?.emoji || '📌'}</span>
                          <span>{tx.categoria}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {format(new Date(tx.data), 'dd MMM yyyy', { locale: it })}
                      </td>
                      <td className={`px-4 py-4 text-right font-semibold ${isPositive ? 'text-sky-600' : 'text-slate-900'}`}>
                        {isPositive ? '+' : '-'}€{tx.importo.toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      Nessun movimento recente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
