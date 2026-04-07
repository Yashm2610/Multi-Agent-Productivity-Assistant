import React from 'react';
import { LayoutDashboard, CheckCircle2, Calendar, FileText, Settings, HelpCircle, Bot } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'tasks', icon: CheckCircle2, label: 'Tasks' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'notes', icon: FileText, label: 'Notes' },
  ];

  const bottomItems = [
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'help', icon: HelpCircle, label: 'Help' },
  ];

  return (
    <div className="w-64 h-full flex flex-col bg-black/40 backdrop-blur-xl border-r border-white/5">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Bot size={24} className="text-white" />
        </div>
        <div className="font-bold text-xl tracking-tight">Nexus</div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
              activeTab === item.id 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon size={20} className={cn(
              "transition-colors",
              activeTab === item.id ? "text-white" : "text-gray-500 group-hover:text-white"
            )} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-4 py-6 space-y-2 border-t border-white/5">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <item.icon size={20} className="text-gray-500" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
