import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Toggle } from '../components/Toggle';
import { SettingRow } from '../components/SettingRow';
import { Table } from '../components/Table';
import { useToast } from '../components/Toast';
import { useModules } from '../context/ModulesContext';

export const Leveling: React.FC = () => {
  const { enabledModules, toggleModule } = useModules();
  const enabled = enabledModules['leveling'];
  const { addToast } = useToast();

  const [settings, setSettings] = useState({ minXp: 15, maxXp: 25, announce: true, channel: 'current' });

  const lb = [
    { rank: 1, name: 'Slayer99', level: 42, xp: '15,240' },
    { rank: 2, name: 'DiscordMod', level: 38, xp: '12,900' },
    { rank: 3, name: 'Chiller', level: 25, xp: '6,450' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[900px] mx-auto animate-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Leveling</h1>
          <p className="text-[var(--text-muted)]">Reward active members with XP and roles.</p>
        </div>
        <Toggle on={enabled} onChange={() => toggleModule('leveling')} />
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex flex-col gap-6">
          <Card>
            <h3 className="font-display font-bold text-lg mb-2">XP Rates</h3>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Min XP per msg</label>
                <input type="number" value={settings.minXp} onChange={e => setSettings(p => ({...p, minXp: +e.target.value}))} className="w-full text-center" />
              </div>
              <div className="text-[var(--text-faint)] mt-4">to</div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Max XP per msg</label>
                <input type="number" value={settings.maxXp} onChange={e => setSettings(p => ({...p, maxXp: +e.target.value}))} className="w-full text-center" />
              </div>
            </div>
            <p className="text-xs text-[var(--text-faint)] mt-3">XP is given randomly between these values. 60s cooldown between messages.</p>
          </Card>
          
          <Card>
            <h3 className="font-display font-bold text-lg mb-2">Level Up Messages</h3>
            <SettingRow 
              label="Announce Level Ups" 
              control={<Toggle on={settings.announce} onChange={v => setSettings(p => ({...p, announce: v}))} />}
            />
            {settings.announce && (
              <div className="mt-2">
                <label className="text-xs font-semibold block mb-1">Channel</label>
                <select value={settings.channel} onChange={e => setSettings(p => ({...p, channel: e.target.value}))} className="w-full text-sm">
                  <option value="current">Current Channel</option>
                  <option value="123">#level-ups</option>
                </select>
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <h3 className="font-display font-bold text-lg mb-4 text-[var(--amber)]">Leaderboard Preview</h3>
            <Table 
              columns={[
                { key: 'rank', header: '#', width: '40px', render: (r) => <span className="font-bold text-[var(--text-faint)]">#{r.rank}</span> },
                { key: 'name', header: 'User', render: (r) => <span className="font-semibold">{r.name}</span> },
                { key: 'level', header: 'Level', render: (r) => <span className="px-2 py-0.5 bg-[var(--surface-3)] rounded font-mono text-xs">Lv {r.level}</span> },
                { key: 'xp', header: 'Total XP', render: (r) => <span className="text-[var(--accent)] font-mono text-xs">{r.xp} XP</span> },
              ]}
              data={lb}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
