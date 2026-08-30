import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Toggle } from '../components/Toggle';
import { useToast } from '../components/Toast';
import { useModules } from '../context/ModulesContext';
import { useDashboard } from '../context/DashboardContext';
import { apiGet, apiPost } from '../lib/api';

interface AutomodConfig {
  enabled: boolean;
  anti_spam: boolean; anti_caps: boolean; caps_threshold: number;
  anti_links: boolean; anti_invites: boolean; anti_mass_mention: boolean;
  mention_threshold: number; word_filter_enabled: boolean; banned_words: string[];
  escalation_enabled: boolean; escalation_warns: number; escalation_action: string;
}

const DEFAULT: AutomodConfig = {
  enabled: false,
  anti_spam: false, anti_caps: false, caps_threshold: 70,
  anti_links: false, anti_invites: false, anti_mass_mention: false,
  mention_threshold: 5, word_filter_enabled: false, banned_words: [],
   escalation_enabled: false, escalation_warns: 3, escalation_action: 'timeout',
};

export const Moderation: React.FC = () => {
  const { enabledModules, toggleModule } = useModules();
  const enabled = enabledModules['automod'];
  const { addToast } = useToast();
  const { selectedGuildId } = useDashboard();

  const [config, setConfig] = useState<AutomodConfig>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newWord, setNewWord] = useState('');

  useEffect(() => {
    if (!selectedGuildId) return;
    setLoading(true);
    apiGet<AutomodConfig>(`/api/guild/${selectedGuildId}/automod`)
      .then(data => setConfig({ ...DEFAULT, ...data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedGuildId]);

  const save = async () => {
    if (!selectedGuildId) return;
    setSaving(true);
    try {
      await apiPost(`/api/guild/${selectedGuildId}/automod`, config);
      addToast('AutoMod settings saved!', 'success');
    } catch { addToast('Failed to save settings.', 'error'); }
    finally { setSaving(false); }
  };

  const toggle = (key: keyof AutomodConfig, val: boolean) =>
    setConfig(p => ({ ...p, [key]: val }));

  const addWord = () => {
    const w = newWord.trim().toLowerCase();
    if (!w || config.banned_words.includes(w)) return;
    setConfig(p => ({ ...p, banned_words: [...p.banned_words, w] }));
    setNewWord('');
  };

  const removeWord = (w: string) =>
    setConfig(p => ({ ...p, banned_words: p.banned_words.filter(x => x !== w) }));

  const filters = [
    { key: 'anti_spam' as const,         label: 'Anti-Spam',     desc: 'Prevent rapid message sending' },
    { key: 'anti_caps' as const,         label: 'Anti-Caps',     desc: 'Prevent messages with excessive capital letters' },
    { key: 'anti_links' as const,        label: 'Anti-Links',    desc: 'Delete suspicious external links' },
    { key: 'anti_invites' as const,      label: 'Anti-Invites',  desc: 'Block Discord invite links' },
    { key: 'anti_mass_mention' as const, label: 'Mass Mentions', desc: `Block messages pinging more than ${config.mention_threshold} users` },
    { key: 'word_filter_enabled' as const, label: 'Word Filter', desc: 'Delete messages containing banned words' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[900px] mx-auto animate-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Auto-Moderation</h1>
          <p className="text-[var(--text-muted)]">Keep chat clean without manual intervention.</p>
        </div>
         <Toggle on={enabled} onChange={(value) => { toggleModule('automod'); setConfig(p => ({ ...p, enabled: value })); }} />
      </div>

      {loading ? <p className="text-sm text-[var(--text-faint)]">Loading settings…</p> : (
        <>
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {filters.map(f => (
              <div key={f.key} className="flex items-center justify-between p-4 border border-[var(--border)] rounded-[var(--radius)] bg-[var(--surface)]">
                <div>
                  <div className="font-semibold">{f.label}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">{f.desc}</div>
                </div>
                <Toggle on={config[f.key] as boolean} onChange={v => toggle(f.key, v)} />
              </div>
            ))}
          </div>

          {config.word_filter_enabled && (
            <Card className={!enabled ? 'opacity-50 pointer-events-none' : ''}>
              <h3 className="font-display font-bold text-lg mb-3">Banned Words</h3>
              <div className="flex gap-2 mb-3">
                <input type="text" value={newWord} onChange={e => setNewWord(e.target.value)} onKeyDown={e => e.key === 'Enter' && addWord()} placeholder="Type a word and press Enter" className="flex-1 text-sm" />
                <button onClick={addWord} className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.banned_words.length === 0
                  ? <p className="text-xs text-[var(--text-faint)]">No banned words yet.</p>
                  : config.banned_words.map(w => (
                    <span key={w} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[rgba(255,107,107,0.1)] border border-[rgba(255,107,107,0.2)] text-[var(--red)] text-xs font-mono">
                      {w}<button onClick={() => removeWord(w)} className="hover:opacity-70">×</button>
                    </span>
                  ))}
              </div>
            </Card>
          )}

          <Card className={!enabled ? 'opacity-50 pointer-events-none' : ''}>
            <h3 className="font-display font-bold text-lg mb-4">Warning Escalation</h3>
            <div className="flex items-center gap-3 mb-4">
              <Toggle on={config.escalation_enabled} onChange={v => toggle('escalation_enabled', v)} />
              <span className="text-sm font-medium">Enable escalation</span>
            </div>
            {config.escalation_enabled && (
              <div className="flex items-center gap-4 bg-[var(--surface-2)] p-4 rounded-lg border border-[var(--border-light)]">
                <span className="text-sm font-medium whitespace-nowrap">When a user reaches</span>
                <select value={config.escalation_warns} onChange={e => setConfig(p => ({ ...p, escalation_warns: +e.target.value }))} className="w-16 text-center text-sm font-bold bg-[var(--surface)]">
                  {[2,3,4,5,7,10].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-sm font-medium whitespace-nowrap">warnings,</span>
                <select value={config.escalation_action} onChange={e => setConfig(p => ({ ...p, escalation_action: e.target.value }))} className="w-36 text-sm font-bold bg-[var(--surface)] text-[var(--red)] border-[rgba(255,107,107,0.3)]">
                   <option value="timeout">Timeout</option>
                  <option value="kick">Kick</option>
                  <option value="ban">Ban</option>
                </select>
              </div>
            )}
          </Card>

          <button onClick={save} disabled={saving} className="w-fit px-6 py-2.5 rounded-[var(--radius-sm)] bg-[var(--accent)] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? 'Saving…' : 'Save All Settings'}
          </button>
        </>
      )}
    </div>
  );
};
