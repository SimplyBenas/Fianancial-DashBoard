import React from 'react';
import { LayoutDashboard, CalendarDays, Target, PieChart, Receipt, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'dashboard' | 'annual' | 'sinking' | 'networth' | 'transactions' | 'settings';

interface SidebarProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function Sidebar({ currentTab, onTabChange }: SidebarProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'annual', label: 'Visione Annuale', icon: CalendarDays },
    { id: 'sinking', label: 'Sinking Funds', icon: Target },
    { id: 'networth', label: 'Stato Patrimoniale', icon: PieChart },
    { id: 'transactions', label: 'Transazioni', icon: Receipt },
    { id: 'settings', label: 'Impostazioni', icon: Settings },
  ] as const;

  return (
    <aside className="w-64 border-r border-blue-100/50 bg-white flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
          FinanceFlow
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-sky-50 text-sky-600 font-medium" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={20} className={cn(isActive ? "text-sky-600" : "text-slate-400")} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            US
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-medium text-slate-900">User</span>
            <span className="text-xs text-slate-500">Free Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
