import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, TrendingUp, Settings, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BottomNav = () => {
  const { t } = useTranslation();

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/market', icon: TrendingUp, label: 'Market' },
    { to: '/dashboard-grid', icon: LayoutGrid, label: 'Tools' }, // Placeholder for a grid of all tools
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <div className="glassmorphism flex items-center justify-around py-3 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 transition-colors duration-200 ${
                  isActive ? 'text-[var(--color-neon-cyan)]' : 'text-[var(--color-text-secondary)]'
                }`
              }
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-mono uppercase tracking-tighter">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
