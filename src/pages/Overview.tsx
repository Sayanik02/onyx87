import React from 'react';
import { Card } from '../components/Card';
import { StatCard } from '../components/StatCard';
import { ModuleId, useModules } from '../context/ModulesContext';
import { useDashboard } from '../context/DashboardContext';
import { Users, Gavel, AlertTriangle, Ticket, Shield, Zap, CircleDashed } from 'lucide-react';
import { Link } from 'wouter';
import { Badge } from '../components/Badge';

export const Overview: React.FC = () => {
  const { enabledModules } = useModules();
  const { stats, selectedGuild } = useDashboard();
  const totalFeatures = Object.keys(enabledModules).length;
  const activeFeatures = Object.values(enabledModules).filter(Boolean).length;
  const disabledFeatures = totalFeatures - activeFeatures;
  const progressPercent = (activeFeatures / totalFeatures) * 100;

  const antinukeActive = enabledModules['antinuke'];

  const timelineEvents = [
    { type: 'ban', label: 'Ban', desc: 'User123 was banned by Admin', time: '10 mins ago', color: 'var(--red)', icon: Gavel },
    { type: 'warn', label: 'Warning', desc: 'User456 warned for spam', time: '1 hr ago', color: 'var(--amber)', icon: AlertTriangle },
    { type: 'ticket', label: 'Ticket', desc: 'Support-0045 opened', time: '2 hrs ago', color: 'var(--accent)', icon: Ticket },
    { type: 'delete', label: 'Delete', desc: 'Message deleted in #general', time: '5 hrs ago', color: 'var(--text-muted)', icon: CircleDashed },
    { type: 'kick', label: 'Kick', desc: 'User789 kicked by AutoMod', time: '1 day ago', color: 'var(--red)', icon: Gavel },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Module Health Bar */}
      <Card noPadding className="overflow-hidden border border-[var(--border)]">
        <div className="h-1.5 w-full bg-[var(--surface-3)]">
          <div 
            className="h-full bg-[var(--accent)] transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="p-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-[var(--text)]">
              {activeFeatures} of {totalFeatures} features active <span className="text-[var(--text-faint)] font-normal ml-1">· {disabledFeatures} disabled</span>
            </span>
            <span className="text-xs text-[var(--text-muted)] mt-1">Disabled features are hidden from !help</span>
          </div>
          <Link href="/modules" className="px-4 py-2 text-sm font-semibold rounded-[var(--radius-sm)] border border-[var(--border-light)] hover:bg-[var(--surface-2)] transition-colors">
            Manage Features
          </Link>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={<Users />} label="Members" value={stats?.members?.toLocaleString() || '—'} color="var(--accent)" trend={<Badge variant="new">Live</Badge>} />
        <StatCard icon={<Gavel />} label="Mod actions (all time)" value={stats?.modActions?.toLocaleString() || '—'} color="var(--accent)" />
        <StatCard icon={<AlertTriangle />} label="Active warnings" value={stats?.warns?.toLocaleString() || '—'} color="var(--amber)" />
        <StatCard icon={<Ticket />} label="Open tickets" value={stats?.openTickets?.toLocaleString() || '—'} color="var(--green)" />
        <StatCard icon={<Shield />} label="Antinuke" value={stats?.antinukeOn ? 'Active' : 'Disabled'} color={stats?.antinukeOn ? 'var(--green)' : 'var(--amber)'} />
        <StatCard icon={<Zap />} label="Auto-react rules" value={stats?.autoReactRules?.toLocaleString() || '—'} color="var(--accent)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline */}
        <Card className="lg:col-span-2">
          <div className="mb-6">
            <h3 className="font-display font-bold text-lg">Recent Activity</h3>
            <p className="text-sm text-[var(--text-muted)]">Live stream of important server events for {selectedGuild?.name || 'your selected server'}.</p>
          </div>
          
          <div className="flex flex-col gap-6 relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-[var(--surface-3)] z-0" />
            
            {stats?.recentActions?.length ? stats.recentActions.map((ev, i) => (
              <div key={i} className="flex gap-4 relative z-10 group">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'color-mix(in srgb, var(--accent) 15%, var(--surface))', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' }}
                >
                  <Gavel size={14} />
                </div>
                <div className="flex-1 pt-1 pb-2 border-b border-[var(--border-light)] group-last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm text-[var(--text)]">{String(ev.reason || ev.action || 'Recent moderation action')}</span>
                    <span className="text-xs text-[var(--text-faint)] font-mono">{String(ev.created_at || 'live')}</span>
                  </div>
                  <Badge variant="default" className="scale-90 origin-left" style={{ color: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
                    {String(ev.action || 'Activity')}
                  </Badge>
                </div>
              </div>
            )) : timelineEvents.map((ev, i) => (
              <div key={i} className="flex gap-4 relative z-10 group">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `color-mix(in srgb, ${ev.color} 15%, var(--surface))`, color: ev.color, border: `1px solid color-mix(in srgb, ${ev.color} 30%, transparent)` }}
                >
                  <ev.icon size={14} />
                </div>
                <div className="flex-1 pt-1 pb-2 border-b border-[var(--border-light)] group-last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm text-[var(--text)]">{ev.desc}</span>
                    <span className="text-xs text-[var(--text-faint)] font-mono">{ev.time}</span>
                  </div>
                  <Badge variant="default" className="scale-90 origin-left" style={{ color: ev.color, borderColor: `color-mix(in srgb, ${ev.color} 30%, transparent)`, background: `color-mix(in srgb, ${ev.color} 10%, transparent)` }}>
                    {ev.label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Mini Module Status Grid */}
        <Card className="lg:col-span-1">
          <div className="mb-6">
            <h3 className="font-display font-bold text-lg">Module Status</h3>
            <p className="text-sm text-[var(--text-muted)]">Click any to configure.</p>
          </div>
          
          <div className="flex flex-col gap-2">
            {(Object.entries(enabledModules) as [ModuleId, boolean][]).slice(0, 7).map(([id, enabled]) => (
              <Link key={id} href={['antinuke', 'backups', 'automod', 'tickets', 'welcome', 'autoreact', 'leveling', 'logging'].includes(id) ? `/${id === 'automod' ? 'moderation' : id}` : '/modules'}>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border-light)] hover:border-[var(--border)] cursor-pointer transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-[var(--green)] shadow-[0_0_8px_var(--green)]' : 'bg-[var(--surface-3)]'}`} />
                    <span className="text-sm font-medium capitalize group-hover:text-[var(--accent)] transition-colors">{id}</span>
                  </div>
                  <span className="text-xs text-[var(--text-faint)] font-mono">{enabled ? 'ON' : 'OFF'}</span>
                </div>
              </Link>
            ))}
            <Link href="/modules" className="text-center text-xs font-semibold text-[var(--accent)] hover:underline mt-2">
              View all {totalFeatures} modules →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
