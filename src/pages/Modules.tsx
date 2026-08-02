import React, { useState } from 'react';
import { ModuleId, useModules } from '../context/ModulesContext';
import { useToast } from '../components/Toast';
import { ModuleCard } from '../components/ModuleCard';
import { Badge } from '../components/Badge';

type CategoryModule = {
  id: string;
  name: string;
  desc: string;
  configPath?: string;
  isPremium?: boolean;
  isNew?: boolean;
};

type Category = {
  id: 'protection' | 'engagement' | 'community' | 'utility';
  name: string;
  icon: string;
  modules: CategoryModule[];
};

export const Modules: React.FC = () => {
  const { enabledModules, toggleModule } = useModules();
  const { addToast } = useToast();
  const [filter, setFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [search, setSearch] = useState('');

  const total = Object.keys(enabledModules).length;
  const enabledCount = Object.values(enabledModules).filter(Boolean).length;

  const handleToggle = (id: ModuleId) => {
    toggleModule(id);
    const wasEnabled = enabledModules[id];
    if (wasEnabled) {
      addToast(`Module disabled — hidden from !help`, 'warning');
    } else {
      addToast(`Module enabled`, 'success');
    }
  };

  const categories: Category[] = [
    {
      id: 'protection',
      name: 'Protection',
      icon: '🛡️',
      modules: [
        { id: 'antinuke', name: 'Antinuke', desc: 'Prevent mass bans, channel deletes, and permission grabs. The most critical protection layer.', configPath: '/antinuke' },
        { id: 'backups', name: 'Backups', desc: 'Auto-snapshot your server. Restore roles, channels, and settings in minutes.', isPremium: true, configPath: '/backups' },
        { id: 'automod', name: 'Auto-Moderation', desc: 'Block spam, caps, links, and mass mentions automatically.', isNew: true, configPath: '/moderation' },
      ]
    },
    {
      id: 'engagement',
      name: 'Engagement',
      icon: '📢',
      modules: [
        { id: 'tickets', name: 'Tickets', desc: 'Let members open support tickets with categories and AI assistance.', configPath: '/tickets' },
        { id: 'welcome', name: 'Welcome Messages', desc: 'Greet new members with embeds, DMs, and auto-roles.', configPath: '/welcome' },
        { id: 'leave', name: 'Leave Messages', desc: 'Notify the server when someone leaves.' },
        { id: 'autoreact', name: 'Auto-React', desc: 'Auto-react to messages matching trigger words.', configPath: '/autoreact' },
        { id: 'joindm', name: 'Join DM', desc: 'DM new members automatically when they join.' },
      ]
    },
    {
      id: 'community',
      name: 'Community',
      icon: '🎮',
      modules: [
        { id: 'leveling', name: 'Leveling', desc: 'XP system with leaderboard, rank cards, and level-up announcements.', configPath: '/leveling' },
        { id: 'economy', name: 'Economy', desc: 'Virtual currency, shop, daily rewards, and gambling minigames.', isNew: true },
        { id: 'counting', name: 'Counting', desc: 'Channel-based counting game with fail detection.', isNew: true },
      ]
    },
    {
      id: 'utility',
      name: 'Utility',
      icon: '🔧',
      modules: [
        { id: 'logging', name: 'Logging', desc: 'Detailed audit logs for message edits, deletions, joins, bans, and more.', configPath: '/logging' },
        { id: 'reactionroles', name: 'Reaction Roles', desc: 'Self-assignable roles via emoji reactions.', isNew: true },
        { id: 'autorole', name: 'Auto-Role', desc: 'Assign roles automatically when members join.', isNew: true },
        { id: 'birthdays', name: 'Birthdays', desc: 'Track and announce member birthdays.', isNew: true },
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-8 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 tracking-tight">Feature Modules</h1>
          <p className="text-[var(--text-muted)] max-w-xl">
            Enable only what your server needs. Disabled modules are hidden from !help — your server stays curated.
          </p>
        </div>
        
        <div className="relative w-24 h-24 flex items-center justify-center hidden sm:flex">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--surface-3)" strokeWidth="8" />
            <circle 
              cx="50" cy="50" r="40" fill="transparent" 
              stroke="var(--accent)" strokeWidth="8" strokeDasharray="251.2" 
              strokeDashoffset={251.2 - (251.2 * (enabledCount / total))}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-bold text-xl">{enabledCount}</span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">/ {total}</span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Search modules..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface-2)] border-[var(--border)] rounded-full text-sm"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>
        
        <div className="flex bg-[var(--surface-2)] p-1 rounded-full border border-[var(--border-light)] w-full sm:w-auto">
          {(['all', 'enabled', 'disabled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-full capitalize transition-all ${
                filter === f 
                  ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-10">
        {categories.map(cat => {
          const catModules = cat.modules.filter(m => {
            const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase());
            const isEnabled = enabledModules[m.id as ModuleId];
            const matchesFilter = filter === 'all' || (filter === 'enabled' && isEnabled) || (filter === 'disabled' && !isEnabled);
            return matchesSearch && matchesFilter;
          });

          if (catModules.length === 0) return null;

          const catEnabledCount = catModules.filter(m => enabledModules[m.id as ModuleId]).length;

          return (
            <div key={cat.id} className="animate-in">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">{cat.icon}</span>
                <h2 className="font-display font-bold text-xl">{cat.name}</h2>
                <Badge variant="default" className="ml-2 font-mono">{catEnabledCount} / {catModules.length}</Badge>
                <div className="flex-1 border-t border-[var(--border-light)] ml-4" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catModules.map(mod => (
                  <ModuleCard
                    key={mod.id}
                    id={mod.id as ModuleId}
                    name={mod.name}
                    description={mod.desc}
                    category={cat.id}
                    isPremium={mod.isPremium}
                    isNew={mod.isNew}
                    enabled={enabledModules[mod.id as ModuleId]}
                    onToggle={handleToggle}
                    configPath={mod.configPath}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-[var(--accent-dim)] border border-[var(--accent-border)] rounded-lg text-sm text-[var(--text)] flex items-start gap-3">
        <div className="text-[var(--accent)] mt-0.5">ℹ️</div>
        <div>
          <span className="font-bold block mb-1">Changes take effect immediately</span>
          <span className="text-[var(--text-muted)]">
            Members will see a clean !help menu based on what your server uses. Disabled commands won't clutter the chat.
          </span>
        </div>
      </div>
    </div>
  );
};
