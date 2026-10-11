import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, PiggyBank, Settings, Award } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'This Week', icon: Calendar },
    { to: '/summary', label: 'Week Summary', icon: Award },
    { to: '/savings', label: 'Savings Pot', icon: PiggyBank },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Navigation Header Strip */}
      <nav className="hidden sm:block border-b border-navy-800/60 bg-navy-950/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-all duration-150 ${
                    isActive
                      ? 'border-emerald-400 text-emerald-400 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-950/95 backdrop-blur-lg border-t border-navy-800 px-2 py-1.5 shadow-2xl">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
                    isActive
                      ? 'text-emerald-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-300'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};

