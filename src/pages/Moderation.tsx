import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Toggle } from '../components/Toggle';
import { useToast } from '../components/Toast';
import { useModules } from '../context/ModulesContext';

export const Moderation: React.FC = () => {
  const { enabledModules, toggleModule } = useModules();
  const enabled = enabledModules['automod'];
  const { addToast } = useToast();

  const [toggles, setToggles] = useState({ spam: true, caps: true, links: true, massMention: true, badWords: false });

  const handleToggle = (k: string, v: boolean) => {
    setToggles(p => ({...p, [k]: v}));
    addToast('AutoMod filter updated');
  };

  const filters = [
    { key: 'spam', label: 'Anti-Spam', desc: 'Prevent rapid message sending' },
    { key: 'caps', label: 'Anti-Caps', desc: 'Prevent messages with excessive capital letters' },
    { key: 'links', label: 'Anti-Links', desc: 'Delete unapproved invites and suspicious links' },
    { key: 'massMention', label: 'Mass Mentions', desc: 'Block messages pinging more than 5 users' },
    { key: 'badWords', label: 'Bad Words', desc: 'Delete profanity based on a customizable list' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[900px] mx-auto animate-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Auto-Moderation</h1>
          <p className="text-[var(--text-muted)]">Keep chat clean without manual intervention.</p>
        </div>
        <Toggle on={enabled} onChange={() => toggleModule('automod')} />
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {filters.map(f => (
          <div key={f.key} className="flex items-center justify-between p-4 border border-[var(--border)] rounded-[var(--radius)] bg-[var(--surface)]">
            <div>
              <div className="font-semibold">{f.label}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{f.desc}</div>
            </div>
            <Toggle on={toggles[f.key as keyof typeof toggles]} onChange={v => handleToggle(f.key, v)} />
          </div>
        ))}
      </div>

      <Card className={`mt-4 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <h3 className="font-display font-bold text-lg mb-4">Warning Thresholds</h3>
        <p className="text-sm text-[var(--text-muted)] mb-6">What happens when a user accumulates too many AutoMod warnings?</p>
        
        <div className="flex items-center gap-4 bg-[var(--surface-2)] p-4 rounded-lg border border-[var(--border-light)]">
          <span className="text-sm font-medium whitespace-nowrap">When a user reaches</span>
          <select className="w-16 text-center text-sm font-bold bg-[var(--surface)]"><option>3</option><option>5</option></select>
          <span className="text-sm font-medium whitespace-nowrap">warnings in 24h,</span>
          <select className="w-32 text-sm font-bold bg-[var(--surface)] text-[var(--red)] border-[rgba(255,107,107,0.3)]">
            <option>Timeout 1h</option>
            <option>Kick</option>
            <option>Ban</option>
          </select>
        </div>
      </Card>
    </div>
  );
};
