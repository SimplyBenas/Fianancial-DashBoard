import React from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Landmark, CreditCard } from 'lucide-react';

export default function NetWorthPage() {
  const { assets, debts, settings } = useFinanceStore();

  const totaleInvestimenti = assets.reduce((acc, a) => acc + (a.quantita * a.prezzoAttuale), 0);
  const totaleCostoInvestimenti = assets.reduce((acc, a) => acc + (a.quantita * a.pmc), 0);
  const pnlTotale = totaleInvestimenti - totaleCostoInvestimenti;
  const pnlPercentuale = (pnlTotale / totaleCostoInvestimenti) * 100;

  const totaleDebiti = debts.reduce((acc, d) => acc + (d.valoreDebitoIniziale - d.totalePagato), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Stato Patrimoniale</h2>
        <p className="text-slate-500 mt-1">Visione d'insieme dei tuoi investimenti e debiti.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Investimenti */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 text-xl font-semibold text-slate-900">
            <Landmark className="text-indigo-500" />
            <h3>Investimenti & Liquidità</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500 mb-1">Valore Attuale</p>
                <h4 className="text-2xl font-bold text-slate-900">€{totaleInvestimenti.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</h4>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500 mb-1">P&L Totale</p>
                <div className={`flex items-center space-x-2 text-2xl font-bold ${pnlTotale >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {pnlTotale >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                  <h4>€{Math.abs(pnlTotale).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</h4>
                </div>
                <p className={`text-sm mt-1 ${pnlTotale >= 0 ? 'text-emerald-600/80' : 'text-rose-500/80'}`}>
                  {pnlTotale >= 0 ? '+' : ''}{pnlPercentuale.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Asset</th>
                    <th className="px-4 py-3 text-right">Q.tà</th>
                    <th className="px-4 py-3 text-right">PMC</th>
                    <th className="px-4 py-3 text-right">Prezzo Att.</th>
                    <th className="px-4 py-3 text-right">Valore</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => {
                    const valore = asset.quantita * asset.prezzoAttuale;
                    const pnl = valore - (asset.quantita * asset.pmc);
                    const isPositive = pnl >= 0;

                    return (
                      <tr key={asset.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 font-medium text-slate-900">{asset.asset}</td>
                        <td className="px-4 py-4 text-right text-slate-600">{asset.quantita}</td>
                        <td className="px-4 py-4 text-right text-slate-500">€{asset.pmc.toFixed(2)}</td>
                        <td className="px-4 py-4 text-right text-slate-900">€{asset.prezzoAttuale.toFixed(2)}</td>
                        <td className="px-4 py-4 text-right">
                          <div className="font-semibold text-slate-900">€{valore.toLocaleString('it-IT')}</div>
                          <div className={`text-xs ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {isPositive ? '+' : ''}€{pnl.toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Debiti */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 text-xl font-semibold text-slate-900">
            <CreditCard className="text-rose-500" />
            <h3>Passività & Debiti</h3>
          </div>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 mb-1">Totale Debito Residuo</p>
              <h4 className="text-2xl font-bold text-rose-500">€{totaleDebiti.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</h4>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {debts.map((debt) => {
                  const residuo = debt.valoreDebitoIniziale - debt.totalePagato;
                  const percentualePagata = (debt.totalePagato / debt.valoreDebitoIniziale) * 100;

                  return (
                    <div key={debt.id} className="p-6 space-y-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-slate-900">{debt.nome}</h4>
                        <span className="text-sm font-medium text-slate-500">Rata: €{debt.rataMensile}/mese</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-sky-600">Pagato: €{debt.totalePagato.toLocaleString('it-IT')}</span>
                          <span className="text-rose-500">Residuo: €{residuo.toLocaleString('it-IT')}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-sky-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentualePagata}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
