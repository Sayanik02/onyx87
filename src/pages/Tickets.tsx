import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { SettingRow } from '../components/SettingRow';
import { Toggle } from '../components/Toggle';
import { StatCard } from '../components/StatCard';
import { useToast } from '../components/Toast';
import { Ticket as TicketIcon, CheckCircle2, Bot, Plus, Trash } from 'lucide-react';
import { useModules } from '../context/ModulesContext';
import { useDashboard } from '../context/DashboardContext';
import { apiDelete, apiGet, apiPost } from '../lib/api';

interface TicketCategory {
  id: number;
  name: string;
  emoji: string;
  description: string;
  style: string;
  position: number;
}

interface TicketSettingsState {
  categoryId: string;
  logChannel: string;
  supportRole: string;
  message: string;
  aiSupport: boolean;
  aiPersona: string;
  knowledgeBase: string;
}

export const Tickets: React.FC = () => {
  const { enabledModules, toggleModule } = useModules();
  const enabled = enabledModules['tickets'];
  const { addToast } = useToast();
  const { selectedGuildId } = useDashboard();

  const [settings, setSettings] = useState<TicketSettingsState>({
    categoryId: '',
    logChannel: '',
    supportRole: '',
    message: 'Thank you for opening a ticket! A staff member will be with you shortly.',
    aiSupport: false,
    aiPersona: 'general',
    knowledgeBase: '',
  });
  const [stats, setStats] = useState({ openCount: 0, closedWeek: 0 });
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', emoji: '🎫', description: '', style: 'primary' });

  const loadData = async () => {
    if (!selectedGuildId) return;

    try {
      setLoading(true);
      const data = await apiGet<{ stats: { openCount: number; closedWeek: number }; enabled: boolean; categoryId: string; logChannel: string; supportRole: string; message: string; categories: TicketCategory[]; aiEnabled: boolean; aiMode: string; aiContext: string }>(`/api/guild/${selectedGuildId}/tickets`);
      setStats(data.stats || { openCount: 0, closedWeek: 0 });
      setSettings({
        categoryId: data.categoryId || '',
        logChannel: data.logChannel || '',
        supportRole: data.supportRole || '',
        message: data.message || 'Thank you for opening a ticket! A staff member will be with you shortly.',
        aiSupport: Boolean(data.aiEnabled),
        aiPersona: data.aiMode || 'general',
        knowledgeBase: data.aiContext || '',
      });
      setCategories(data.categories || []);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Unable to load ticket settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [selectedGuildId]);

  const updateSetting = (key: keyof TicketSettingsState, value: string | boolean) => {
    setSettings((current) => ({ ...current, [key]: value as never }));
  };

  const handleSave = async () => {
    if (!selectedGuildId) return;

    try {
      setSaving(true);
      await apiPost(`/api/guild/${selectedGuildId}/tickets`, {
        enabled: enabled ? 1 : 0,
        categoryId: settings.categoryId,
        logChannel: settings.logChannel,
        supportRole: settings.supportRole,
        message: settings.message,
        aiEnabled: settings.aiSupport ? 1 : 0,
        aiMode: settings.aiPersona,
        aiContext: settings.knowledgeBase,
      });
      addToast('Ticket settings saved', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Could not save ticket settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async () => {
    if (!selectedGuildId || !newCategory.name.trim()) return;

    try {
      await apiPost(`/api/guild/${selectedGuildId}/tickets/categories`, {
        name: newCategory.name.trim(),
        emoji: newCategory.emoji || '🎫',
        description: newCategory.description.trim(),
        style: newCategory.style,
      });
      setNewCategory({ name: '', emoji: '🎫', description: '', style: 'primary' });
      await loadData();
      addToast('Category added', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Could not add category', 'error');
    }
  };

  const handleRemoveCategory = async (categoryId: number) => {
    if (!selectedGuildId) return;

    try {
      await apiDelete(`/api/guild/${selectedGuildId}/tickets/categories/${categoryId}`);
      await loadData();
      addToast('Category removed', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Could not remove category', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[900px] mx-auto animate-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Tickets</h1>
          <p className="text-[var(--text-muted)]">Private support channels for your members.</p>
        </div>
        <Toggle on={enabled} onChange={() => toggleModule('tickets')} />
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity ${!enabled ? 'opacity-50' : ''}`}>
        <StatCard icon={<TicketIcon />} label="Open Tickets" value={String(stats.openCount)} color="var(--accent)" />
        <StatCard icon={<CheckCircle2 />} label="Closed (7d)" value={String(stats.closedWeek)} color="var(--green)" />
        <StatCard icon={<Bot />} label="AI Assistant" value={settings.aiSupport ? 'On' : 'Off'} color="#A78BFA" />
      </div>

      <Card className={!enabled ? 'opacity-50 pointer-events-none' : ''}>
        <h3 className="font-display font-bold text-lg mb-2">Channel Setup</h3>
        <SettingRow label="Ticket Category ID" hint="The category where new ticket channels will be created" control={<input type="text" value={settings.categoryId} onChange={(event) => updateSetting('categoryId', event.target.value)} className="w-48 font-mono text-xs" />} />
        <SettingRow label="Transcript Channel" hint="Where closed ticket transcripts will be logged" control={<input type="text" value={settings.logChannel} onChange={(event) => updateSetting('logChannel', event.target.value)} className="w-48 font-mono text-xs" />} />
        <SettingRow label="Support Role" hint="Role that has access to view all tickets" control={<input type="text" value={settings.supportRole} onChange={(event) => updateSetting('supportRole', event.target.value)} className="w-48 font-mono text-xs" />} />
        <SettingRow label="Opening Message" hint="Sent inside the ticket when it is opened" control={<textarea value={settings.message} onChange={(event) => updateSetting('message', event.target.value)} rows={3} className="w-full max-w-xl" />} />
        <div className="mt-3 flex justify-end">
          <button className="btn-primary" onClick={() => void handleSave()} disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button>
        </div>
      </Card>

      <Card className={!enabled ? 'opacity-50 pointer-events-none' : ''}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-bold text-lg">Ticket Categories</h3>
            <p className="text-sm text-[var(--text-muted)]">Users will choose one of these when opening a ticket.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input type="text" value={newCategory.name} onChange={(event) => setNewCategory((current) => ({ ...current, name: event.target.value }))} placeholder="Category name" className="w-full" />
          <input type="text" value={newCategory.emoji} onChange={(event) => setNewCategory((current) => ({ ...current, emoji: event.target.value }))} placeholder="Emoji" className="w-full" />
          <input type="text" value={newCategory.description} onChange={(event) => setNewCategory((current) => ({ ...current, description: event.target.value }))} placeholder="Description" className="w-full md:col-span-2" />
          <select value={newCategory.style} onChange={(event) => setNewCategory((current) => ({ ...current, style: event.target.value }))} className="w-full md:col-span-2">
            <option value="primary">Blurple</option>
            <option value="secondary">Grey</option>
            <option value="success">Green</option>
            <option value="danger">Red</option>
          </select>
          <button className="btn-secondary md:col-span-2" onClick={() => void handleAddCategory()}><Plus size={14} /> Add category</button>
        </div>

        <div className="flex flex-col gap-3">
          {categories.length === 0 ? (
            <div className="text-sm text-[var(--text-muted)]">No categories yet. Add one above to create the ticket panel options.</div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="flex items-center gap-4 p-3 rounded-lg border border-[var(--border-light)] bg-[var(--surface-2)]">
                <div className="text-2xl w-10 h-10 flex items-center justify-center bg-[var(--surface)] rounded border border-[var(--border)]">{category.emoji || '🎫'}</div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{category.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{category.description || 'No description'}</div>
                </div>
                <button className="text-[var(--text-faint)] hover:text-[var(--red)] p-2 transition-colors" onClick={() => void handleRemoveCategory(category.id)}>
                  <Trash size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className={!enabled ? 'opacity-50 pointer-events-none' : ''}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-lg flex items-center gap-2"><Bot className="text-[#A78BFA]" size={20} /> AI Assistant</h3>
            <p className="text-sm text-[var(--text-muted)]">Let Onyx answer tickets automatically before pinging staff.</p>
          </div>
          <Toggle on={settings.aiSupport} onChange={(value) => updateSetting('aiSupport', value)} />
        </div>

        {settings.aiSupport && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] flex flex-col gap-4 animate-in">
            <SettingRow label="AI Persona" hint="How should the AI talk?" control={<select value={settings.aiPersona} onChange={(event) => updateSetting('aiPersona', event.target.value)} className="w-48 text-sm"><option value="general">General support</option><option value="minecraft">Minecraft hosting support</option><option value="vps">VPS / server admin support</option><option value="hosting">Web hosting &amp; domains support</option><option value="tech">Technical support</option></select>} />
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm">Knowledge Base Context</label>
              <p className="text-xs text-[var(--text-muted)]">Add facts the AI should know (server rules, common links, etc.)</p>
              <textarea value={settings.knowledgeBase} onChange={(event) => updateSetting('knowledgeBase', event.target.value)} className="w-full h-32 text-sm font-mono text-[var(--text-faint)]" placeholder="Paste your server rules, plans, pricing, or FAQ here." />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
