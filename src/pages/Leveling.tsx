import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Toggle } from '../components/Toggle';
import { SettingRow } from '../components/SettingRow';
import { Table } from '../components/Table';
import { useToast } from '../components/Toast';
import { useModules } from '../context/ModulesContext';
import { useDashboard } from '../context/DashboardContext';
import { apiGet, apiPost } from '../lib/api';

interface LevelingConfig { enabled: boolean; xp_min: number; xp_max: number; announce: boolean; channel_id: string | null; }
interface LeaderboardEntry { rank: number; user_id: string; name: string; level: number; xp: string; }

export const Leveling: React.FC = () => {
  const { enabledModules, toggleModule } = useModules();
  const enabled = enabledModules['leveling'];
  const { addToast } = useToast();
  const { selectedGuildId, guildInfo } = useDashboard();

  const [settings, setSettings] = useState<LevelingConfig>({ enabled: false, xp_min: 15, xp_max: 25, announce: false, channel_id: null });
  const [lb, setLb] = useState<LeaderboardEntry[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingLb, setLoadingLb] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedGuildId) return;
    setLoadingConfig(true);
    setLoadingLb(true);
    apiGet<LevelingConfig>(`/api/guild/${selectedGuildId}/leveling`)
      .then(data => setSettings(data)).catch(() => {}).finally(() => setLoadingConfig(false));
    apiGet<LeaderboardEntry[]>(`/api/guild/${selectedGuildId}/leaderboard`)
      .then(data => setLb(data)).catch(() => setLb([])).finally(() => setLoadingLb(false));
  }, [selectedGuildId]);

  const handleSave = async () => {
    if (!selectedGuildId) return;
    setSaving(true);
    try {
      await apiPost(`/api/guild/${selectedGuildId}/leveling`, settings);
      addToast('Leveling settings saved!', 'success');
    } catch { addToast('Failed to save settings.', 'error'); }
    finally { setSaving(false); }
  };

  const channels = guildInfo?.channels || [];

  return (
    <div className="flex flex-col gap-6 max-w-[900px] mx-auto animate-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Leveling</h1>
          <p className="text-[var(--text-muted)]">Reward active members with XP and roles.</p>
        </div>
         <Toggle on={enabled} onChange={(value) => { toggleModule('leveling'); setSettings(p => ({ ...p, enabled: value })); }} />
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex flex-col gap-6">
          <Card>
            <h3 className="font-display font-bold text-lg mb-2">XP Rates</h3>
            {loadingConfig ? <p className="text-sm text-[var(--text-faint)]">Loading…</p> : (
              <>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Min XP per msg</label>
                    <input type="number" value={settings.xp_min} onChange={e => setSettings(p => ({ ...p, xp_min: +e.target.value }))} className="w-full text-center" />
                  </div>
                  <div className="text-[var(--text-faint)] mt-4">to</div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Max XP per msg</label>
                    <input type="number" value={settings.xp_max} onChange={e => setSettings(p => ({ ...p, xp_max: +e.target.value }))} className="w-full text-center" />
                  </div>
                </div>
                <p className="text-xs text-[var(--text-faint)] mt-3">XP is given randomly between these values. 60s cooldown between messages.</p>
              </>
            )}
          </Card>

          <Card>
            <h3 className="font-display font-bold text-lg mb-2">Level Up Messages</h3>
            <SettingRow label="Announce Level Ups" control={<Toggle on={settings.announce} onChange={v => setSettings(p => ({ ...p, announce: v }))} />} />
            {settings.announce && (
              <div className="mt-2">
                <label className="text-xs font-semibold block mb-1">Channel</label>
                <select value={settings.channel_id || ''} onChange={e => setSettings(p => ({ ...p, channel_id: e.target.value || null }))} className="w-full text-sm">
                  <option value="">Current Channel</option>
                  {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                </select>
              </div>
            )}
            <button onClick={handleSave} disabled={saving} className="mt-4 w-full px-4 py-2 rounded-[var(--radius-sm)] bg-[var(--accent)] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </Card>
        </div>

        <div>
          <Card>
            <h3 className="font-display font-bold text-lg mb-4 text-[var(--amber)]">
              Leaderboard <span className="text-xs font-normal text-[var(--text-faint)] ml-1">(live from your server)</span>
            </h3>
            {loadingLb ? <p className="text-sm text-[var(--text-faint)]">Loading leaderboard…</p>
              : lb.length === 0 ? <p className="text-sm text-[var(--text-faint)]">No XP data yet. Members earn XP by chatting.</p>
               : (
                 <>
                   <div className="hidden md:block">
                     <Table
                       columns={[
                         { key: 'rank',  header: '#',        width: '40px', render: (r) => <span className="font-bold text-[var(--text-faint)]">#{r.rank}</span> },
                         { key: 'name',  header: 'User',                    render: (r) => <span className="font-semibold">{r.name}</span> },
                         { key: 'level', header: 'Level',                   render: (r) => <span className="px-2 py-0.5 bg-[var(--surface-3)] rounded font-mono text-xs">Lv {r.level}</span> },
                         { key: 'xp',    header: 'Total XP',                render: (r) => <span className="text-[var(--accent)] font-mono text-xs">{r.xp} XP</span> },
                       ]}
                       data={lb}
                     />
                   </div>
                   <div className="flex flex-col md:hidden -mx-2">
                     {lb.map((entry) => (
                       <div key={entry.user_id} className="flex items-center gap-3 px-2 py-3 border-b border-[var(--border)] last:border-0">
                         <span className="w-8 shrink-0 font-bold text-xs text-[var(--text-faint)]">#{entry.rank}</span>
                         <span className="min-w-0 flex-1 truncate font-semibold text-sm">{entry.name}</span>
                         <span className="shrink-0 px-2 py-1 bg-[var(--surface-3)] rounded font-mono text-xs">Lv {entry.level}</span>
                         <span className="shrink-0 text-[var(--accent)] font-mono text-[11px]">{entry.xp} XP</span>
                       </div>
                     ))}
                   </div>
                 </>
               )}
          </Card>
        </div>
      </div>
    </div>
  );
};
