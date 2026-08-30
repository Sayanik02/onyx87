import React from 'react';
import { Menu } from 'lucide-react';
import { useLocation } from 'wouter';
import { useDashboard } from '../context/DashboardContext';

export const Topbar: React.FC<{ onMenu?: () => void }> = ({ onMenu }) => {
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
    <div className="min-h-16 w-full glass-header flex items-center justify-between gap-3 px-4 sm:px-8 py-3 sticky top-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        <button type="button" aria-label="Open navigation" onClick={onMenu} className="p-2 -ml-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] md:hidden">
          <Menu size={21} />
        </button>
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[var(--text-muted)] min-w-0">
          <span className="hidden sm:inline truncate max-w-[120px]">{user?.username || 'Community Hub'}</span>
          <span className="hidden sm:inline">/</span>
          <span className="truncate max-w-[130px] sm:max-w-[240px]">{selectedGuild?.name || 'Select a server'}</span>
          <span>/</span>
          <span className="text-[var(--text)] whitespace-nowrap">{getPageName()}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] shrink-0">
        <div className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" />
        <span className="text-[11px] sm:text-xs font-medium">Bot online</span>
      </div>
    </div>
  );
};
