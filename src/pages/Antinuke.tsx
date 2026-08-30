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
    enabled: false,
    antiBan: { on: true, limit: 3 },
    antiKick: { on: true, limit: 3 },
    antiChannel: { on: true, limit: 2 },
    antiRole: { on: true, limit: 2 },
    antiBot: { on: true, limit: 1 },
    antiPerms: { on: true, limit: 1 },
    punishment: 'ban',
    dmExecutor: true
  });
  const [canManage, setCanManage] = useState(false);
  const [whitelist, setWhitelist] = useState<Array<{ id: string; name: string; added: string }>>([]);

  useEffect(() => {
    const load = async () => {
      if (!selectedGuildId) return;
      try {
        const data = await apiGet<{ can_manage: boolean; enabled: boolean; punishment: string; dm_user: boolean; whitelist: Array<{ user_id: string }>; limits: Array<{ action_type: string; action_limit: number }> }>(`/api/guild/${selectedGuildId}/antinuke`);
        setCanManage(Boolean(data.can_manage));
        const limitMap: Record<string, keyof typeof settings> = {
          ban: 'antiBan', kick: 'antiKick', channel_delete: 'antiChannel',
          role_delete: 'antiRole', bot_add: 'antiBot', role_perm_grant: 'antiPerms',
        };
        setSettings((prev) => {
          const next = { ...prev, enabled: Boolean(data.enabled), punishment: data.punishment || prev.punishment, dmExecutor: data.dm_user ?? prev.dmExecutor };
          for (const limit of data.limits || []) {
            const key = limitMap[limit.action_type];
            if (key) next[key] = { ...next[key], limit: Number(limit.action_limit) };
          }
          return next;
        });
        setWhitelist((data.whitelist || []).map((item) => ({ id: String(item.user_id), name: `User ${item.user_id}`, added: 'Synced' })));
      } catch (err) {
        addToast(err instanceof Error ? err.message : 'Could not load antinuke settings', 'warning');
      }
    };

    void load();
  }, [selectedGuildId]);

  const updateSetting = async (key: keyof typeof settings, val: any) => {
    const next = { ...settings, [key]: val };
    setSettings(next);
    if (!selectedGuildId) return;

    try {
      await apiPost(`/api/guild/${selectedGuildId}/antinuke`, {
         enabled: next.enabled,
         punishment: next.punishment,
         dm_user: next.dmExecutor,
      });
      addToast('Settings saved', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Could not save antinuke settings', 'warning');
    }
  };

  const updateSubSetting = async (key: 'antiBan' | 'antiKick' | 'antiChannel' | 'antiRole' | 'antiBot' | 'antiPerms', subKey: 'on' | 'limit', val: any) => {
    const next = { ...settings, [key]: { ...settings[key], [subKey]: val } };
    setSettings(next);
    if (!selectedGuildId) return;

    try {
      await apiPost(`/api/guild/${selectedGuildId}/antinuke`, {
         enabled: next.enabled,
         punishment: next.punishment,
         dm_user: next.dmExecutor,
         limits: [
           { action: 'ban', limit: next.antiBan.limit, window: 10 },
           { action: 'kick', limit: next.antiKick.limit, window: 10 },
           { action: 'channel_delete', limit: next.antiChannel.limit, window: 10 },
           { action: 'role_delete', limit: next.antiRole.limit, window: 10 },
           { action: 'bot_add', limit: next.antiBot.limit, window: 10 },
           { action: 'role_perm_grant', limit: next.antiPerms.limit, window: 10 },
         ],
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
       <button disabled={!canManage} className="text-[var(--text-faint)] hover:text-[var(--red)] transition-colors p-1 disabled:opacity-40 disabled:cursor-not-allowed" onClick={async () => {
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
           onClick={() => { toggleModule('antinuke'); setSettings(p => ({ ...p, enabled: true })); addToast('Antinuke enabled', 'success'); }}
           disabled={!canManage}
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
         <Toggle disabled={!canManage} on={enabled} onChange={(value) => { toggleModule('antinuke'); setSettings(p => ({ ...p, enabled: value } as typeof p)); }} />
      </div>
       {!canManage && (
         <div className="rounded-lg border border-[var(--accent-border)] bg-[var(--accent-dim)] px-4 py-3 text-sm text-[var(--text-muted)]">
           Only the Discord server owner or an AntiNuke extra owner can change these settings. You can view the current configuration, but editing is locked.
         </div>
       )}

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
                 <Toggle disabled={!canManage} on={settings[p.key].on} onChange={(v) => updateSubSetting(p.key, 'on', v)} />
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
                     disabled={!canManage || !settings[p.key].on}
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
               disabled={!canManage}
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
           control={<Toggle disabled={!canManage} on={settings.dmExecutor} onChange={v => updateSetting('dmExecutor', v)} />}
        />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">Whitelisted Users</h3>
          <button
             disabled={!canManage}
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
