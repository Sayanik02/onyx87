import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Toggle } from '../components/Toggle';
import { Table } from '../components/Table';
import { useToast } from '../components/Toast';
import { useModules } from '../context/ModulesContext';
import { useDashboard } from '../context/DashboardContext';
import { apiDelete, apiGet, apiPost } from '../lib/api';
import { Plus, Trash, Zap } from 'lucide-react';

interface AutoReactRule {
  id: number;
  trigger: string;
  emoji: string;
  match_type: string;
}

export const AutoReact: React.FC = () => {
  const { enabledModules, toggleModule } = useModules();
  const enabled = enabledModules['autoreact'];
  const { addToast } = useToast();
  const { selectedGuildId } = useDashboard();

  const [trigger, setTrigger] = useState('');
  const [emoji, setEmoji] = useState('');
  const [matchType, setMatchType] = useState('contains');
  const [rules, setRules] = useState<AutoReactRule[]>([]);

  const loadRules = async () => {
    if (!selectedGuildId) return;

    try {
      const data = await apiGet<{ rules: AutoReactRule[] }>(`/api/guild/${selectedGuildId}/autoreact`);
      setRules(data.rules || []);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Unable to load auto-react rules', 'error');
    }
  };

  useEffect(() => {
    void loadRules();
  }, [selectedGuildId]);

  const handleAdd = async () => {
    if (!selectedGuildId || !trigger || !emoji) return;

    try {
      await apiPost(`/api/guild/${selectedGuildId}/autoreact`, { trigger, emoji, matchType });
      setTrigger('');
      setEmoji('');
      setMatchType('contains');
      await loadRules();
      addToast('Rule added', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Could not save rule', 'error');
    }
  };

  const removeRule = async (id: number) => {
    if (!selectedGuildId) return;

    try {
      await apiDelete(`/api/guild/${selectedGuildId}/autoreact/${id}`);
      await loadRules();
      addToast('Rule removed', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Could not remove rule', 'error');
    }
  };

  const columns = [
    { key: 'trigger', header: 'Trigger Word', render: (rule: AutoReactRule) => <span className="font-semibold px-2 py-1 bg-[var(--surface-3)] rounded text-sm">{rule.trigger}</span> },
    { key: 'match_type', header: 'Match Type', render: (rule: AutoReactRule) => <span className="text-[var(--text-faint)] text-xs uppercase tracking-wider font-bold">{rule.match_type === 'exact' ? 'Exact' : 'Contains'}</span> },
    { key: 'emoji', header: 'Reaction', render: (rule: AutoReactRule) => <span className="text-xl">{rule.emoji}</span> },
    { key: 'actions', header: '', width: '60px', render: (rule: AutoReactRule) => (
      <button onClick={() => void removeRule(rule.id)} className="text-[var(--text-faint)] hover:text-[var(--red)] transition-colors p-1">
        <Trash size={16} />
      </button>
    ) }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[900px] mx-auto animate-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Auto-React</h1>
          <p className="text-[var(--text-muted)]">Bot reacts to messages containing specific words.</p>
        </div>
        <Toggle on={enabled} onChange={() => toggleModule('autoreact')} />
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="lg:col-span-1">
          <Card>
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Plus size={18} /> Add Rule</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Trigger Word/Phrase</label>
                <input type="text" value={trigger} onChange={(event) => setTrigger(event.target.value)} placeholder="e.g. hello" className="w-full text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Reaction Emoji</label>
                <input type="text" value={emoji} onChange={(event) => setEmoji(event.target.value)} placeholder="👋" className="w-full text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Match Type</label>
                <select value={matchType} onChange={(event) => setMatchType(event.target.value)} className="w-full text-sm">
                  <option value="contains">Contains (anywhere in message)</option>
                  <option value="exact">Exact (must match exactly)</option>
                </select>
              </div>
              <button onClick={() => void handleAdd()} className="w-full mt-2 py-2 bg-[var(--accent)] text-white font-semibold rounded-[var(--radius-sm)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Zap size={16} /> Create Rule
              </button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">Active Rules</h3>
              <span className="px-2 py-1 bg-[var(--accent-dim)] text-[var(--accent)] rounded text-xs font-bold">{rules.length} Rules</span>
            </div>
            <Table columns={columns} data={rules} emptyMessage="No rules added yet." />
          </Card>
        </div>
      </div>
    </div>
  );
};
