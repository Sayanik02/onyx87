import React from 'react';
import { useLocation } from 'wouter';
import { useDashboard } from '../context/DashboardContext';

export const Topbar: React.FC = () => {
  const [location] = useLocation();
  const { selectedGuild, user } = useDashboard();

  const getPageName = () => {
    switch (location) {
      case '/': return 'Overview';
      case '/modules': return 'Feature Modules';
      case '/antinuke': return 'Antinuke';
      case '/backups': return 'Backups';
      case '/tickets': return 'Tickets';
      case '/welcome': return 'Welcome';
      case '/autoreact': return 'Auto-React';
      case '/moderation': return 'Moderation';
      case '/leveling': return 'Leveling';
      case '/logging': return 'Logging';
      case '/premium': return 'Premium';
      default: return 'Page';
    }
  };

  return (
    <div className="h-16 w-full glass-header flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
        <span>{user?.username || 'Community Hub'}</span>
        <span>/</span>
        <span className="text-[var(--text)]">{selectedGuild?.name || 'Select a server'}</span>
        <span>/</span>
        <span className="text-[var(--text)]">{getPageName()}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)]">
          <div className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" />
          <span className="text-xs font-medium">Bot online</span>
        </div>
      </div>
    </div>
  );
};
