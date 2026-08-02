import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { SettingRow } from '../components/SettingRow';
import { Toggle } from '../components/Toggle';
import { Badge } from '../components/Badge';
import { Table } from '../components/Table';
import { useToast } from '../components/Toast';
import { Shield, Ban, Trash2, UserPlus, Settings, Bot, Trash } from 'lucide-react';
import { useModules } from '../context/ModulesContext';
import { useDashboard } from '../context/DashboardContext';
import { apiDelete, apiGet, apiPost } from '../lib/api';

export const Antinuke: React.FC = () => {
  const { enabledModules, toggleModule } = useModules();
  const enabled = enabledModules['antinuke'];
  const { addToast } = useToast();
  const { selectedGuildId } = useDashboard();

  const [settings, setSettings] = useState({
    antiBan: { on: true, limit: 3 },
    antiKick: { on: true, limit: 3 },
    antiChannel: { on: true, limit: 2 },
    antiRole: { on: true, limit: 2 },
    antiBot: { on: true, limit: 1 },
    antiPerms: { on: true, limit: 1 },
    punishment: 'ban',
    dmExecutor: true
  });
  const [whitelist, setWhitelist] = useState<Array<{ id: string; name: string; added: string }>>([]);

  useEffect(() => {
    const load = async () => {
      if (!selectedGuildId) return;
      try {
        const data = await apiGet<{ enabled: boolean; punishment: string; dm_user: boolean; whitelist: Array<{ user_id: string }> }>(`/api/guild/${selectedGuildId}/antinuke`);
        setSettings((prev) => ({ ...prev, punishment: data.punishment || prev.punishment, dmExecutor: data.dm_user ?? prev.dmExecutor }));
        setWhitelist((data.whitelist || []).map((item) => ({ id: String(item.user_id), name: `User ${item.user_id}`, added: 'Synced' })));
      } catch (err) {
        addToast(err instanceof Error ? err.message : 'Could not load antinuke settings', 'warning');
      }
    };

    void load();
  }, [selectedGuildId]);

  const updateSetting = async (key: keyof typeof settings, val: any) => {
    setSettings(prev => ({ ...prev, [key]: val }));
    if (!selectedGuildId) return;

    try {
      await apiPost(`/api/guild/${selectedGuildId}/antinuke`, {
        enabled: true,
        punishment: typeof val === 'string' ? val : settings.punishment,
        dm_user: typeof val === 'boolean' ? val : settings.dmExecutor,
      });
      addToast('Settings saved', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Could not save antinuke settings', 'warning');
    }
  };

  const updateSubSetting = async (key: 'antiBan' | 'antiKick' | 'antiChannel' | 'antiRole' | 'antiBot' | 'antiPerms', subKey: 'on' | 'limit', val: any) => {
    setSettings(prev => ({ ...prev, [key]: { ...prev[key], [subKey]: val } }));
    if (!selectedGuildId) return;

    try {
      await apiPost(`/api/guild/${selectedGuildId}/antinuke`, {
        enabled: true,
        punishment: settings.punishment,
        dm_user: settings.dmExecutor,
      });
      addToast('Threshold updated', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Could not save antinuke threshold', 'warning');
    }
  };

  const columns = [
    { key: 'id', header: 'User ID', render: (r: any) => <span className="font-mono">{r.id}</span> },
    { key: 'name', header: 'Name', render: (r: any) => <span className="font-semibold">{r.name}</span> },
    { key: 'added', header: 'Added' },
    { key: 'actions', header: '', width: '60px', render: (row: any) => (
      <button className="text-[var(--text-faint)] hover:text-[var(--red)] transition-colors p-1" onClick={async () => {
        if (!selectedGuildId) return;
        try {
          await apiDelete(`/api/guild/${selectedGuildId}/antinuke/whitelist/${row.id}`);
          setWhitelist(prev => prev.filter((item) => item.id !== row.id));
          addToast('User removed from whitelist', 'success');
        } catch (err) {
          addToast(err instanceof Error ? err.message : 'Could not remove whitelist entry', 'warning');
        }
      }}>
        <Trash size={16} />
      </button>
    )}
  ];

  if (!enabled) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield size={64} className="text-[var(--surface-3)] mb-6" />
        <h2 className="text-2xl font-display font-bold mb-2">Antinuke is Disabled</h2>
        <p className="text-[var(--text-muted)] mb-8 max-w-md">Enable Antinuke from the modules page to protect your server from malicious mass-actions.</p>
        <button 
          onClick={() => { toggleModule('antinuke'); addToast('Antinuke enabled', 'success'); }}
          className="px-6 py-3 bg-[var(--accent)] text-white font-semibold rounded-[var(--radius-sm)] hover:opacity-90 transition-opacity"
        >
          Enable Antinuke
        </button>
      </div>
    );
  }

  const protections = [
    { key: 'antiBan' as const, label: 'Anti-Ban', icon: Ban, desc: 'Limit mass banning of members' },
    { key: 'antiKick' as const, label: 'Anti-Kick', icon: Ban, desc: 'Limit mass kicking of members' },
    { key: 'antiChannel' as const, label: 'Anti-Channel Delete', icon: Trash2, desc: 'Limit channel deletions' },
    { key: 'antiRole' as const, label: 'Anti-Role Delete', icon: Settings, desc: 'Limit role deletions' },
    { key: 'antiBot' as const, label: 'Anti-Bot Add', icon: Bot, desc: 'Limit unverified bot invites' },
    { key: 'antiPerms' as const, label: 'Anti-Permission Change', icon: Shield, desc: 'Limit dangerous perm changes' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[900px] mx-auto animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Antinuke</h1>
          <p className="text-[var(--text-muted)]">Protect your server from rogue admins and compromised accounts.</p>
        </div>
        <Toggle on={enabled} onChange={() => toggleModule('antinuke')} />
      </div>

      <Card>
        <h3 className="font-display font-bold text-lg mb-4">Protection Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {protections.map(p => (
            <div key={p.key} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${settings[p.key].on ? 'bg-[var(--accent-dim)] text-[var(--accent)]' : 'bg-[var(--surface-3)] text-[var(--text-faint)]'}`}>
                    <p.icon size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{p.label}</div>
                    <div className="text-xs text-[var(--text-muted)]">{p.desc}</div>
                  </div>
                </div>
                <Toggle on={settings[p.key].on} onChange={(v) => updateSubSetting(p.key, 'on', v)} />
              </div>
              <div className="flex items-center justify-between border-t border-[var(--border-light)] pt-3">
                <span className="text-xs font-medium text-[var(--text-faint)] uppercase tracking-wider">Threshold</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min="1" max="10"
                    value={settings[p.key].limit}
                    onChange={(e) => updateSubSetting(p.key, 'limit', parseInt(e.target.value) || 1)}
                    className="w-16 h-8 text-center text-sm"
                    disabled={!settings[p.key].on}
                  />
                  <span className="text-xs text-[var(--text-muted)]">per 10s</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-bold text-lg mb-2">General Settings</h3>
        <SettingRow 
          label="Punishment Action" 
          hint="Action taken against the executor when a limit is reached"
          control={
            <select 
              value={settings.punishment} 
              onChange={e => updateSetting('punishment', e.target.value)}
              className="w-40 font-medium"
            >
              <option value="ban">Ban User</option>
              <option value="kick">Kick User</option>
              <option value="strip">Strip Roles</option>
              <option value="timeout">Timeout</option>
            </select>
          }
        />
        <SettingRow 
          label="DM Executor" 
          hint="Send a direct message to the user before punishing them"
          control={<Toggle on={settings.dmExecutor} onChange={v => updateSetting('dmExecutor', v)} />}
        />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">Whitelisted Users</h3>
          <button
            onClick={async () => {
              if (!selectedGuildId) return;
              const userId = window.prompt('Enter a Discord user ID to whitelist');
              if (!userId) return;
              try {
                await apiPost(`/api/guild/${selectedGuildId}/antinuke/whitelist`, { user_id: userId });
                setWhitelist(prev => [...prev, { id: userId, name: `User ${userId}`, added: 'Just now' }]);
                addToast('User added to whitelist', 'success');
              } catch (err) {
                addToast(err instanceof Error ? err.message : 'Could not add whitelist user', 'warning');
              }
            }}
            className="px-3 py-1.5 bg-[var(--surface-3)] hover:bg-[var(--border)] transition-colors rounded-[var(--radius-sm)] text-sm font-semibold flex items-center gap-2"
          >
            <UserPlus size={14} /> Add User
          </button>
        </div>
        <Table columns={columns} data={whitelist} />
      </Card>
    </div>
  );
};
