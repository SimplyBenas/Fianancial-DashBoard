import React from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Plus, Target, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function SinkingFundsPage() {
  const { sinkingFunds } = useFinanceStore();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sinking Funds</h2>
          <p className="text-slate-500 mt-1">Gestisci i tuoi obiettivi di risparmio e le spese previste.</p>
        </div>
        <button className="flex items-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-sky-500/20">
          <Plus size={20} />
          <span>Nuovo Fondo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sinkingFunds.map((fund) => {
          const isCompleted = fund.stato === 'Completata';
          const saldoAttuale = fund.risparmioMensile - fund.spese;
          const percentage = Math.min((saldoAttuale / fund.obiettivo) * 100, 100);

          return (
            <Card key={fund.id} className={`transition-all ${isCompleted ? 'opacity-70 border-emerald-500/30' : 'hover:border-blue-200'}`}>
              <CardContent className="p-6 space-y-6">
                
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg text-slate-900 flex items-center space-x-2">
                      <span>{fund.attivita}</span>
                      {isCompleted && <CheckCircle2 size={18} className="text-emerald-500" />}
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center space-x-1">
                      <Target size={14} />
                      <span>Obiettivo: €{fund.obiettivo.toLocaleString('it-IT')}</span>
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                    {fund.stato}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-emerald-600">€{saldoAttuale.toLocaleString('it-IT')}</span>
                    <span className="text-slate-500">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-emerald-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Versati</p>
                    <p className="font-medium text-slate-900">€{fund.risparmioMensile.toLocaleString('it-IT')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Scadenza</p>
                    <p className="font-medium text-slate-900">{format(new Date(fund.dataScadenza), 'MMM yyyy', { locale: it })}</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          );
        })}
      </div>

    </div>
  );
}
