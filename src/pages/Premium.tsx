import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Check, X, Crown } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { useToast } from '../components/Toast';
import { apiGet } from '../lib/api';

const HEXACRAFT_SERVER_URL = 'https://discord.gg/hexacraft';

export const Premium: React.FC = () => {
  const { selectedGuildId } = useDashboard();
  const { addToast } = useToast();
  const [isPremium, setIsPremium] = useState(false);
  const [addedAt, setAddedAt] = useState<string | null>(null);

  useEffect(() => {
    const loadPremium = async () => {
      if (!selectedGuildId) return;
      try {
        const data = await apiGet<{ isPremium: boolean; addedAt?: string | null }>('/api/guild/' + selectedGuildId + '/premium');
        setIsPremium(Boolean(data.isPremium));
        setAddedAt(data.addedAt || null);
      } catch (err) {
        addToast(err instanceof Error ? err.message : 'Could not load premium status', 'error');
      }
    };

    void loadPremium();
  }, [selectedGuildId, addToast]);

  const features = [
    { name: 'Custom Bot Branding', free: false, pro: true },
    { name: 'Server Backups (Automated)', free: false, pro: true },
    { name: 'Advanced Economy', free: false, pro: true },
    { name: 'Priority AI Support', free: false, pro: true },
    { name: 'Auto-Moderation Limits', free: 'Basic', pro: 'Unlimited' },
    { name: 'Ticket Categories', free: 'Up to 3', pro: 'Unlimited' },
    { name: 'Antinuke Protections', free: true, pro: true },
    { name: 'Dashboard Access', free: true, pro: true },
  ];

  return (
    <div className="flex flex-col items-center gap-8 max-w-[900px] mx-auto animate-in pt-4">
      <div className="text-center max-w-2xl">
        <div className="inline-flex items-center justify-center p-3 bg-[rgba(245,166,35,0.1)] text-[var(--amber)] rounded-full mb-4">
          <Crown size={32} />
        </div>
        <h1 className="text-4xl font-display font-bold mb-4">Upgrade to Onyx <span className="text-[var(--amber)]">PRO</span></h1>
        <p className="text-[var(--text-muted)] text-lg">Unlock the full potential of your community with advanced tools, complete white-labeling, and bulletproof automated backups.</p>
      </div>

      <div className="w-full mt-8 rounded-[var(--radius)] border border-[var(--border)] overflow-hidden">
        <div className="grid grid-cols-3 bg-[var(--surface-2)] text-sm font-bold uppercase tracking-wider text-[var(--text-faint)]">
          <div className="p-4 border-r border-[var(--border)]">Features</div>
          <div className="p-4 border-r border-[var(--border)] text-center">Free</div>
          <div className="p-4 text-center text-[var(--amber)] bg-[rgba(245,166,35,0.05)] border-t-[2px] border-t-[var(--amber)]">PRO</div>
        </div>

        {features.map((feature, index) => (
          <div key={index} className="grid grid-cols-3 bg-[var(--surface)] border-t border-[var(--border)] transition-colors hover:bg-[var(--surface-2)]">
            <div className="p-4 border-r border-[var(--border)] font-medium text-sm text-[var(--text)]">{feature.name}</div>
            <div className="p-4 border-r border-[var(--border)] text-center text-sm font-medium text-[var(--text-muted)] flex items-center justify-center">
              {feature.free === true ? <Check size={18} className="text-[var(--green)]" /> : feature.free === false ? <X size={18} className="text-[var(--red)] opacity-50" /> : feature.free}
            </div>
            <div className="p-4 text-center text-sm font-bold text-[var(--text)] bg-[rgba(245,166,35,0.02)] flex items-center justify-center">
              {feature.pro === true ? <Check size={18} className="text-[var(--amber)]" /> : feature.pro}
            </div>
          </div>
        ))}
      </div>

      <div className="w-full flex flex-col md:flex-row gap-6 mt-4">
        <Card className="flex-1 flex flex-col items-center text-center justify-center border-[var(--border-light)] bg-transparent">
          <h3 className="text-xl font-display font-bold mb-2 text-[var(--text)]">Current Plan: {isPremium ? 'PRO' : 'Free'}</h3>
          <p className="text-[var(--text-muted)] text-sm">{isPremium ? `Premium is active${addedAt ? ` since ${addedAt}` : ''}.` : 'You are currently using the free version of Onyx.'}</p>
        </Card>

        <div className="flex-1 p-[1px] rounded-[var(--radius)] bg-gradient-to-br from-[var(--amber)] to-[var(--accent)] shadow-[0_0_20px_rgba(245,166,35,0.15)] hover:shadow-[0_0_30px_rgba(245,166,35,0.25)] transition-shadow">
          <div className="h-full bg-[var(--surface)] rounded-[calc(var(--radius)-1px)] p-6 flex flex-col items-center text-center justify-center">
            <h3 className="text-2xl font-display font-bold mb-1 text-[var(--text)]">$4.99<span className="text-sm font-normal text-[var(--text-muted)]">/month</span></h3>
            <p className="text-sm text-[var(--amber)] font-medium mb-4">Cancel anytime</p>
            <p className="text-xs text-[var(--text-muted)] mb-4">Purchase your plan in the Hexacraft Discord server.</p>
            <a
              href={HEXACRAFT_SERVER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-[var(--text)] text-[var(--bg)] font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Upgrade Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
