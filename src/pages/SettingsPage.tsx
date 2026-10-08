import React from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { settings } = useFinanceStore();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Impostazioni</h2>
          <p className="text-slate-500 mt-1">Configura le categorie, i budget e il capitale iniziale.</p>
        </div>
        <button className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
          <Save size={20} />
          <span>Salva Modifiche</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Generali */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurazione Iniziale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Liquidità Inizio Anno (€)</label>
                <input 
                  type="number" 
                  defaultValue={settings.liquiditaIniziale}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
                <p className="text-xs text-slate-500">Il valore di partenza dei tuoi conti correnti a Gennaio.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Obiettivo Budget Mensile (€)</label>
                <input 
                  type="number" 
                  defaultValue={settings.budgetMensile}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
                <p className="text-xs text-slate-500">Soglia massima di spesa per un singolo mese.</p>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Categorie */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gestione Categorie</CardTitle>
              <button className="text-indigo-400 hover:text-indigo-300 transition-colors p-1">
                <Plus size={20} />
              </button>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-100">
                {settings.categorie.map((cat, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between group">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl bg-slate-100 w-10 h-10 flex items-center justify-center rounded-lg">
                        {cat.emoji}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">{cat.nome}</p>
                        <p className="text-xs text-slate-500">{cat.tipo}</p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
