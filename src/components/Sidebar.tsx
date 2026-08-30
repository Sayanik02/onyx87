import React from 'react';
import { Link, useLocation } from 'wouter';
import { useModules, ModuleId } from '../context/ModulesContext';
import { useDashboard } from '../context/DashboardContext';
import { LayoutDashboard, Sparkles, Shield, Database, ShieldAlert, FileText, Ticket, UserPlus, Zap, Award, Crown, LogOut, X } from 'lucide-react';
import { Badge } from './Badge';

export const Sidebar: React.FC<{ open?: boolean; onClose?: () => void }> = ({ open = false, onClose }) => {
  const [location] = useLocation();
  const { isModuleEnabled } = useModules();
  const { user, selectedGuild, selectGuild, logout } = useDashboard();

  const navItems = [
    { section: 'OVERVIEW' },
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Feature Modules', path: '/modules', icon: Sparkles, badge: 'NEW', badgeVar: 'new' as const },
    { section: 'PROTECTION' },
    { name: 'Antinuke', path: '/antinuke', icon: Shield, module: 'antinuke' as ModuleId },
    { name: 'Backups', path: '/backups', icon: Database, module: 'backups' as ModuleId },
    { section: 'MODERATION' },
    { name: 'Moderation', path: '/moderation', icon: ShieldAlert, module: 'automod' as ModuleId, badge: 'NEW', badgeVar: 'new' as const },
    { name: 'Logging', path: '/logging', icon: FileText, module: 'logging' as ModuleId, badge: 'NEW', badgeVar: 'new' as const },
    { section: 'ENGAGEMENT' },
    { name: 'Tickets', path: '/tickets', icon: Ticket, module: 'tickets' as ModuleId },
    { name: 'Welcome', path: '/welcome', icon: UserPlus, module: 'welcome' as ModuleId },
    { name: 'Auto-React', path: '/autoreact', icon: Zap, module: 'autoreact' as ModuleId },
    { section: 'COMMUNITY' },
    { name: 'Leveling', path: '/leveling', icon: Award, module: 'leveling' as ModuleId, badge: 'NEW', badgeVar: 'new' as const },
    { section: 'ACCOUNT' },
    { name: 'Premium', path: '/premium', icon: Crown, badge: 'PRO', badgeVar: 'premium' as const },
  ];

  const closeOnMobile = () => onClose?.();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeOnMobile}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[260px] h-full flex flex-col flex-shrink-0 border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-200 md:relative md:translate-x-0 md:z-20 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 sm:p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img
                src="/onyx-logo.png"
                alt="Onyx"
                width={32}
                height={32}
                className="rounded-md object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="font-display font-bold text-2xl tracking-tight">Onyx</span>
            </div>
            <button type="button" aria-label="Close navigation" onClick={closeOnMobile} className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] md:hidden">
              <X size={20} />
            </button>
          </div>
          <div className="bg-[var(--surface-2)] border border-[var(--border-light)] rounded-[var(--radius-sm)] p-3 flex flex-col gap-1">
            <span className="font-semibold text-sm truncate">{selectedGuild?.name || 'Select server'}</span>
            <span className="text-[11px] text-[var(--text-faint)] font-mono">{user?.username || 'Discord user'}</span>
            {user && user.guilds.length > 0 && (
              <select
                value={selectedGuild?.id || ''}
                onChange={(e) => selectGuild(e.target.value)}
                className="mt-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs"
              >
                {user.guilds.map((guild) => (
                  <option key={guild.id} value={guild.id}>{guild.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-1 custom-scrollbar">
          {navItems.map((item, i) => {
            if (item.section) {
              return <div key={i} className="text-[10px] font-bold text-[var(--text-faint)] tracking-wider mt-5 mb-2 px-3 uppercase">{item.section}</div>;
            }
            const isActive = location === item.path;
            const isDisabled = item.module && !isModuleEnabled(item.module);
            return (
              <Link key={i} href={item.path || '#'} onClick={closeOnMobile} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${isActive ? 'bg-[var(--accent-dim)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'}`}>
                <div className="relative">
                  {item.icon && <item.icon size={18} className={isActive ? 'text-[var(--accent)]' : 'group-hover:text-[var(--text)] transition-colors'} />}
                  {isDisabled && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--amber)] rounded-full border-[2px] border-[var(--surface)]" title="Module disabled" />}
                </div>
                <span className="font-medium text-sm flex-1">{item.name}</span>
                {item.badge && <Badge variant={item.badgeVar || 'default'}>{item.badge}</Badge>}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[var(--border)] mt-auto">
          <div className="flex items-center gap-3 px-2 py-2 hover:bg-[var(--surface-2)] rounded-lg cursor-pointer transition-colors group">
            <img src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin&backgroundColor=5B8DFF'} alt="Avatar" className="w-10 h-10 rounded-full border border-[var(--border)]" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold truncate text-[var(--text)]">{user?.username || 'Discord Admin'}</span>
              <span className="text-xs text-[var(--accent)] font-medium">Dashboard access</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); void logout(); }} className="text-[var(--text-faint)] hover:text-[var(--red)] transition-colors p-1 rounded-md hover:bg-[rgba(255,107,107,0.1)]">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
