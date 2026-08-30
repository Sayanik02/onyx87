import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Toggle } from '../components/Toggle';
import { useToast } from '../components/Toast';
import { useModules } from '../context/ModulesContext';
import { useDashboard } from '../context/DashboardContext';
import { apiGet, apiPost } from '../lib/api';

const EVENT_GROUPS = [
  { cat: 'Messages', items: [{ key: 'message_delete', label: 'Message Delete' }, { key: 'message_edit', label: 'Message Edit' }] },
  { cat: 'Members',  items: [{ key: 'member_join', label: 'Member Join' }, { key: 'member_leave', label: 'Member Leave' }, { key: 'member_ban', label: 'Member Ban' }, { key: 'member_unban', label: 'Member Unban' }, { key: 'nick_change', label: 'Nickname Change' }] },
  { cat: 'Server',   items: [{ key: 'role_create', label: 'Role Create' }, { key: 'role_delete', label: 'Role Delete' }, { key: 'channel_create', label: 'Channel Create' }, { key: 'channel_delete', label: 'Channel Delete' }] },
];
const ALL_EVENTS = EVENT_GROUPS.flatMap(g => g.items.map(i => i.key));

interface LoggingConfig { enabled: boolean; channel_id: string; events: string[]; }

export const Logging: React.FC = () => {
  const { enabledModules, toggleModule } = useModules();
  const enabled = enabledModules['logging'];
  const { addToast } = useToast();
  const { selectedGuildId, guildInfo } = useDashboard();

  const [config, setConfig] = useState<LoggingConfig>({ enabled: false, channel_id: '', events: ALL_EVENTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (!selectedGuildId) return;
    setLoading(true);
    apiGet<LoggingConfig>(`/api/guild/${selectedGuildId}/logging`)
      .then(data => setConfig({ enabled: data.enabled ?? false, channel_id: data.channel_id ?? '', events: data.events ?? ALL_EVENTS }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedGuildId]);

  const save = async () => {
    if (!selectedGuildId) return;
    setSaving(true);
    try {
      await apiPost(`/api/guild/${selectedGuildId}/logging`, config);
      addToast('Logging settings saved!', 'success');
    } catch { addToast('Failed to save settings.', 'error'); }
    finally { setSaving(false); }
  };

  const toggleEvent = (key: string) =>
    setConfig(p => ({ ...p, events: p.events.includes(key) ? p.events.filter(e => e !== key) : [...p.events, key] }));

  const channels = guildInfo?.channels || [];

  return (
    <div className="flex flex-col gap-6 max-w-[900px] mx-auto animate-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Audit Logging</h1>
          <p className="text-[var(--text-muted)]">Track everything that happens in your server.</p>
        </div>
         <Toggle on={enabled} onChange={(value) => { toggleModule('logging'); setConfig(p => ({ ...p, enabled: value })); }} />
      </div>

      {loading ? <p className="text-sm text-[var(--text-faint)]">Loading settings…</p> : (
        <>
          <Card className={!enabled ? 'opacity-50 pointer-events-none' : ''}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-lg mb-1">Log Channel</h3>
                <p className="text-sm text-[var(--text-muted)]">Where should Onyx send the logs?</p>
              </div>
              <select value={config.channel_id} onChange={e => setConfig(p => ({ ...p, channel_id: e.target.value }))} className="w-52 text-sm">
                <option value="">— choose a channel —</option>
                {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
              </select>
            </div>
          </Card>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {EVENT_GROUPS.map(group => (
              <Card key={group.cat} noPadding>
                <div className="p-4 bg-[var(--surface-2)] border-b border-[var(--border)] rounded-t-[var(--radius)] flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[var(--text)] uppercase tracking-wider">{group.cat}</h3>
                  <button className="text-[10px] font-semibold text-[var(--accent)] hover:underline" onClick={() => {
                    const keys = group.items.map(i => i.key);
                    const allOn = keys.every(k => config.events.includes(k));
                    setConfig(p => ({ ...p, events: allOn ? p.events.filter(e => !keys.includes(e)) : [...new Set([...p.events, ...keys])] }));
                  }}>
                    {group.items.every(i => config.events.includes(i.key)) ? 'Disable all' : 'Enable all'}
                  </button>
                </div>
                <div className="p-2">
                  {group.items.map(item => (
                    <div key={item.key} className="flex items-center justify-between p-3 hover:bg-[var(--surface-2)] rounded-lg transition-colors">
                      <span className="text-sm font-medium text-[var(--text)]">{item.label}</span>
                      <Toggle on={config.events.includes(item.key)} onChange={() => toggleEvent(item.key)} />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <button onClick={save} disabled={saving} className="w-fit px-6 py-2.5 rounded-[var(--radius-sm)] bg-[var(--accent)] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </>
      )}
    </div>
  );
};
