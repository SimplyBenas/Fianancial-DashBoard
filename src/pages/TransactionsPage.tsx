import React, { useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Search, Filter, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function TransactionsPage() {
  const { transactions, settings, deleteTransaction } = useFinanceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || tx.tipo === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Transazioni</h2>
        <p className="text-slate-500 mt-1">Gestisci e filtra tutti i tuoi movimenti.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Cerca transazione..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="appearance-none bg-white border border-slate-200 text-slate-900 rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
          >
            <option value="all">Tutti i tipi</option>
            <option value="Entrata">Entrate</option>
            <option value="Spesa">Uscite</option>
            <option value="Risparmio">Risparmi</option>
          </select>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-right">Importo</th>
                <th className="px-6 py-4 text-center">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => {
                const category = settings.categorie.find(c => c.nome === tx.categoria);
                const isPositive = tx.tipo === 'Entrata';
                
                return (
                  <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {format(new Date(tx.data), 'dd MMM yyyy', { locale: it })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{tx.nome}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                        <span>{category?.emoji || '📌'}</span>
                        <span>{tx.categoria}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                        tx.tipo === 'Entrata' ? 'bg-emerald-50 text-emerald-600' :
                        tx.tipo === 'Spesa' ? 'bg-rose-50 text-rose-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {tx.tipo}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${isPositive ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {isPositive ? '+' : '-'}€{tx.importo.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nessuna transazione trovata.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
