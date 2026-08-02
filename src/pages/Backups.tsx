import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { SettingRow } from '../components/SettingRow';
import { Toggle } from '../components/Toggle';
import { Table } from '../components/Table';
import { useToast } from '../components/Toast';
import { Database, Plus, RefreshCw, Trash, Crown } from 'lucide-react';
import { useModules } from '../context/ModulesContext';
import { useDashboard } from '../context/DashboardContext';
import { apiDelete, apiGet, apiPost } from '../lib/api';

interface BackupRecord {
  backupId: string;
  createdAt: string;
  label: string;
  roles: number;
  channels: number;
  emojis: number;
}

export const Backups: React.FC = () => {
  const { enabledModules, toggleModule } = useModules();
  const enabled = enabledModules['backups'];
  const { addToast } = useToast();
  const { selectedGuildId } = useDashboard();

  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [frequency, setFrequency] = useState('24');
  const [creating, setCreating] = useState(false);
  const [backups, setBackups] = useState<BackupRecord[]>([]);

  const loadBackups = async () => {
    if (!selectedGuildId) return;

    try {
      setLoading(true);
      const data = await apiGet<{ isPremium: boolean; schedule: { enabled: boolean; intervalH: number }; backups: BackupRecord[] }>(`/api/guild/${selectedGuildId}/backups`);
      setIsPremium(Boolean(data.isPremium));
      setScheduled(Boolean(data.schedule?.enabled));
      setFrequency(String(data.schedule?.intervalH || '24'));
      setBackups(data.backups || []);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Unable to load backups', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBackups();
  }, [selectedGuildId]);

  const handleCreateBackup = async () => {
    if (!selectedGuildId) return;
    setCreating(true);
    try {
      addToast('Create the backup with >backup create in Discord and it will appear here automatically.', 'info');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!selectedGuildId) return;
    try {
      await apiPost(`/api/guild/${selectedGuildId}/backups/schedule`, {
        enabled: scheduled,
        intervalH: Number(frequency),
        maxKeep: 10,
      });
      addToast('Backup schedule updated', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Could not update backup schedule', 'error');
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!selectedGuildId) return;
    if (!window.confirm(`Delete backup ${backupId}?`)) return;

    try {
      await apiDelete(`/api/guild/${selectedGuildId}/backups/${backupId}`);
      setBackups((current) => current.filter((backup) => backup.backupId !== backupId));
      addToast('Backup deleted', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to delete backup', 'error');
    }
  };

  const columns = [
    { key: 'backupId', header: 'Backup ID', render: (r: BackupRecord) => <span className="font-mono text-xs">{r.backupId}</span> },
    { key: 'createdAt', header: 'Date Created' },
    { key: 'stats', header: 'Contents', render: (r: BackupRecord) => (
      <span className="text-[var(--text-muted)] text-xs">
        {r.roles} roles, {r.channels} channels, {r.emojis} emojis
      </span>
    ) },
    { key: 'label', header: 'Label', render: (r: BackupRecord) => (
      <span className="text-[var(--text-faint)] text-[11px] uppercase tracking-wider font-bold">
        {r.label || 'Snapshot'}
      </span>
    ) },
    { key: 'actions', header: '', width: '90px', render: (r: BackupRecord) => (
      <div className="flex items-center justify-end gap-2">
        <button className="text-[var(--text-muted)] hover:text-[var(--red)] transition-colors p-1 bg-[var(--surface-3)] rounded" title="Delete" onClick={() => void handleDeleteBackup(r.backupId)}>
          <Trash size={14} />
        </button>
      </div>
    ) }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[900px] mx-auto animate-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
            Backups
            <span className="px-2 py-1 bg-gradient-to-r from-[rgba(245,166,35,0.2)] to-[rgba(245,166,35,0.05)] text-[var(--amber)] text-xs font-bold uppercase tracking-wider rounded border border-[rgba(245,166,35,0.3)] flex items-center gap-1">
              <Crown size={12} /> Premium
            </span>
          </h1>
          <p className="text-[var(--text-muted)]">Snapshot your server structure and restore it anytime.</p>
        </div>
        <Toggle on={enabled} onChange={() => toggleModule('backups')} />
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="font-display font-bold text-lg mb-1">Create Manual Backup</h3>
            <p className="text-sm text-[var(--text-muted)]">Backups are created by the bot. Run the command in Discord and the latest snapshots will appear here.</p>
          </div>
          <button
            onClick={() => void handleCreateBackup()}
            disabled={!enabled || creating}
            className={`px-5 py-2.5 bg-[var(--accent)] text-white font-semibold rounded-[var(--radius-sm)] flex items-center gap-2 transition-all ${creating ? 'opacity-70 cursor-wait' : 'hover:opacity-90'} disabled:opacity-50`}
          >
            {creating ? <RefreshCw size={18} className="animate-spin" /> : <Plus size={18} />}
            {creating ? 'Preparing...' : 'Create Backup'}
          </button>
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-bold text-lg mb-2">Automated Backups</h3>
        {!isPremium && (
          <div className="mb-4 rounded-lg border border-[var(--amber)]/30 bg-[rgba(245,166,35,0.08)] px-3 py-2 text-sm text-[var(--amber)]">
            Premium is required to enable automatic server backups.
          </div>
        )}
        <SettingRow
          label="Scheduled Backups"
          hint="Automatically backup your server at regular intervals"
          control={<Toggle on={scheduled} onChange={(value) => { setScheduled(value); }} disabled={!enabled || !isPremium} />}
        />
        <SettingRow
          label="Backup Frequency"
          hint="How often Onyx should create a snapshot"
          control={
            <select
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
              className="w-40 font-medium"
              disabled={!scheduled || !enabled || !isPremium}
            >
              <option value="6">Every 6 hours</option>
              <option value="12">Every 12 hours</option>
              <option value="24">Every 24 hours</option>
              <option value="168">Every 7 days</option>
            </select>
          }
        />
        <div className="mt-4 flex justify-end">
          <button className="btn-secondary" onClick={() => void handleSaveSchedule()} disabled={!enabled || !isPremium}>
            Save schedule
          </button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">Backup History</h3>
          {loading && <span className="text-sm text-[var(--text-muted)]">Loading…</span>}
        </div>
        <div className={!enabled ? 'opacity-50 pointer-events-none' : ''}>
          <Table columns={columns} data={backups} emptyMessage="No backups yet. Create one from Discord to populate this list." />
        </div>
      </Card>
    </div>
  );
};
