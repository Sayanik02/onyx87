import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Toggle } from '../components/Toggle';
import { useToast } from '../components/Toast';
import { useModules } from '../context/ModulesContext';
import { useDashboard } from '../context/DashboardContext';
import { apiGet, apiPost } from '../lib/api';
import { X } from 'lucide-react';

const PLACEHOLDERS: [string, string][] = [
  ['{user}', '@member mention'],
  ['{username}', 'Display name'],
  ['{usertag}', 'username#0000'],
  ['{server}', 'Server name'],
  ['{membercount}', 'Member count'],
  ['{userid}', 'User ID'],
  ['{avatar}', 'Avatar URL'],
  ['{account_age}', 'Account age'],
  ['{join_position}', 'Join position'],
  ['{created}', 'Account creation date'],
  ['{joined}', 'Join date'],
  ['{server_icon}', 'Server icon URL'],
];

function fmtDemo(text: string): string {
  return text
    .replace(/\{user\}/g, '@NewMember')
    .replace(/\{username\}/g, 'NewMember')
    .replace(/\{usertag\}/g, 'NewMember#0000')
    .replace(/\{server\}/g, 'Community Hub')
    .replace(/\{membercount\}/g, '1,042')
    .replace(/\{userid\}/g, '123456789')
    .replace(/\{avatar\}/g, '')
    .replace(/\{account_age\}/g, '3 years old')
    .replace(/\{join_position\}/g, '42nd')
    .replace(/\{created\}/g, 'Jan 15, 2020')
    .replace(/\{joined\}/g, 'Jul 17, 2026')
    .replace(/\{server_icon\}/g, '');
}

interface EmbedSettings {
  embedMode: boolean;
  message: string;
  title: string;
  author: string;
  authorIcon: string;
  footer: string;
  thumbnail: string;
  image: string;
  color: string;
  timestamp: boolean;
}

function defaultEmbed(color = '#3DD68C'): EmbedSettings {
  return {
    embedMode: true,
    message: '',
    title: '',
    author: '',
    authorIcon: '',
    footer: '',
    thumbnail: '',
    image: '',
    color,
    timestamp: false,
  };
}

function PlaceholderChips({ targetId }: { targetId: string }) {
  const insert = (ph: string) => {
    const el = document.getElementById(targetId) as HTMLTextAreaElement | HTMLInputElement | null;
    if (!el) return;
    const s = el.selectionStart ?? el.value.length;
    const e = el.selectionEnd ?? el.value.length;
    const newVal = el.value.slice(0, s) + ph + el.value.slice(e);
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set || Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    nativeInputValueSetter?.call(el, newVal);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.focus();
    el.selectionStart = el.selectionEnd = s + ph.length;
  };

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {PLACEHOLDERS.map(([ph, label]) => (
        <button
          key={ph}
          title={label}
          onClick={() => insert(ph)}
          className="text-[11.5px] font-mono px-2 py-1 rounded-md border border-[var(--border)] bg-[var(--surface-3)] text-[var(--accent)] hover:bg-[rgba(91,141,255,0.12)] transition-colors cursor-pointer"
        >
          {ph}
        </button>
      ))}
    </div>
  );
}

function DiscordPreview({ embed, demoDesc, accentInitial }: { embed: EmbedSettings; demoDesc: string; accentInitial: string }) {
  const borderColor = /^#[0-9A-Fa-f]{6}$/.test(embed.color) ? embed.color : accentInitial;
  const desc = fmtDemo(embed.message || demoDesc);
  const title = fmtDemo(embed.title);
  const author = fmtDemo(embed.author);
  const footer = fmtDemo(embed.footer);

  return (
    <div className="bg-[#313338] rounded-lg p-4 font-sans text-[15px]">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-[#5B8DFF] flex items-center justify-center flex-shrink-0 text-white font-bold text-base">O</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white text-sm">Onyx</span>
            <span className="text-[9px] bg-[#5865F2] text-white px-1.5 py-0.5 rounded font-bold tracking-wide">APP</span>
            <span className="text-[#949BA4] text-xs">Today at 12:00 PM</span>
          </div>
          {embed.embedMode ? (
            <div className="rounded-r-md p-3 bg-[#2B2D31] max-w-md border-l-4" style={{ borderLeftColor: borderColor }}>
              {author && (
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-4 h-4 rounded-full bg-[#555]" />
                  <span className="text-xs font-semibold text-[#DBDEE1]">{author}</span>
                </div>
              )}
              {title && <div className="text-sm font-bold text-white mb-1.5">{title}</div>}
              <p className="text-[13px] text-[#DBDEE1] whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: desc }} />
              {footer && (
                <div className="mt-2 text-[11px] text-[#87909E] flex items-center gap-1">
                  <span>{footer}</span>
                  {embed.timestamp && <span>• Today at 12:00 PM</span>}
                </div>
              )}
            </div>
          ) : (
            <p className="text-[13.5px] text-[#DBDEE1] whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: desc }} />
          )}
        </div>
      </div>
    </div>
  );
}

interface EmbedBuilderProps {
  embed: EmbedSettings;
  onChange: (patch: Partial<EmbedSettings>) => void;
  messageId: string;
  demoDesc: string;
  accentColor: string;
}

function EmbedBuilder({ embed, onChange, messageId, demoDesc, accentColor }: EmbedBuilderProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">Message</label>
          <textarea id={messageId} value={embed.message} onChange={(event) => onChange({ message: event.target.value })} rows={3} placeholder={demoDesc} className="w-full resize-y text-sm" />
          <PlaceholderChips targetId={messageId} />
        </div>

        <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
          <div>
            <div className="text-sm font-semibold">Embed mode</div>
            <div className="text-xs text-[var(--text-muted)]">Send a rich embed instead of plain text</div>
          </div>
          <Toggle on={embed.embedMode} onChange={() => onChange({ embedMode: !embed.embedMode })} />
        </div>

        {embed.embedMode && (
          <div className="flex flex-col gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-faint)] mt-1">Embed Builder</div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Title</label>
              <input type="text" value={embed.title} onChange={(event) => onChange({ title: event.target.value })} placeholder="👋 New member!" className="w-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Author text</label>
              <input type="text" value={embed.author} onChange={(event) => onChange({ author: event.target.value })} placeholder="{username} just joined" className="w-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Author icon URL</label>
              <input type="text" value={embed.authorIcon} onChange={(event) => onChange({ authorIcon: event.target.value })} placeholder="{avatar}" className="w-full font-mono text-xs" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Footer text</label>
              <input type="text" value={embed.footer} onChange={(event) => onChange({ footer: event.target.value })} placeholder="Member #{membercount} · Account age: {account_age}" className="w-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Thumbnail URL</label>
              <input type="text" value={embed.thumbnail} onChange={(event) => onChange({ thumbnail: event.target.value })} placeholder="{avatar}" className="w-full font-mono text-xs" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Large image URL</label>
              <input type="text" value={embed.image} onChange={(event) => onChange({ image: event.target.value })} placeholder="https://..." className="w-full font-mono text-xs" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Embed color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={embed.color} onChange={(event) => onChange({ color: event.target.value })} className="w-9 h-9 rounded cursor-pointer p-0.5 border border-[var(--border)] bg-[var(--surface-2)]" />
                <input type="text" value={embed.color} onChange={(event) => onChange({ color: event.target.value })} maxLength={7} className="w-28 font-mono text-xs" />
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-semibold">Show timestamp</div>
                <div className="text-xs text-[var(--text-muted)]">Display the time the member joined</div>
              </div>
              <Toggle on={embed.timestamp} onChange={() => onChange({ timestamp: !embed.timestamp })} />
            </div>
          </div>
        )}
      </div>

      <div className="lg:sticky lg:top-24">
        <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-faint)] mb-3">Live Preview</div>
        <DiscordPreview embed={embed} demoDesc={demoDesc} accentInitial={accentColor} />
        <div className="mt-3 text-xs text-[var(--text-faint)]">Click a placeholder chip above to insert it into your message.</div>
      </div>
    </div>
  );
}

export const Welcome: React.FC = () => {
  const { enabledModules, toggleModule } = useModules();
  const enabled = enabledModules['welcome'];
  const { addToast } = useToast();
  const { selectedGuildId, guildInfo } = useDashboard();

  const [activeTab, setActiveTab] = useState<'welcome' | 'leave' | 'rejoin' | 'dm' | 'autorole' | 'card'>('welcome');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [welcomeEnabled, setWelcomeEnabled] = useState(false);
  const [welcomeChannel, setWelcomeChannel] = useState('');
  const [welcomeEmbed, setWelcomeEmbed] = useState<EmbedSettings>(defaultEmbed('#3DD68C'));

  const [leaveEnabled, setLeaveEnabled] = useState(false);
  const [leaveChannel, setLeaveChannel] = useState('');
  const [leaveEmbed, setLeaveEmbed] = useState<EmbedSettings>(defaultEmbed('#ED4245'));

  const [rejoinEnabled, setRejoinEnabled] = useState(false);
  const [rejoinChannel, setRejoinChannel] = useState('');
  const [rejoinMessage, setRejoinMessage] = useState('');
  const [rejoinColor, setRejoinColor] = useState('#FAA61A');

  const [dmEnabled, setDmEnabled] = useState(false);
  const [dmMessage, setDmMessage] = useState('');
  const [dmEmbed, setDmEmbed] = useState(false);

  const [autoRoles, setAutoRoles] = useState<string[]>([]);
  const [roleSelect, setRoleSelect] = useState('');
  const [cardEnabled, setCardEnabled] = useState(false);

  const channelOptions = guildInfo?.channels ?? [];
  const roleOptions = guildInfo?.roles ?? [];

  const loadConfig = useCallback(async () => {
    if (!selectedGuildId) return;

    try {
      setLoading(true);
      const data = await apiGet<Record<string, unknown>>(`/api/guild/${selectedGuildId}/welcome`);
      setWelcomeEnabled(Boolean(data.enabled));
      setWelcomeChannel(String((data.channel_id as string | undefined) || ''));
      setWelcomeEmbed({
        embedMode: Boolean(data.embed_enabled),
        message: String((data.message as string | undefined) || ''),
        title: String((data.embed_title as string | undefined) || ''),
        author: String((data.embed_author as string | undefined) || ''),
        authorIcon: String((data.embed_author_icon as string | undefined) || ''),
        footer: String((data.embed_footer as string | undefined) || ''),
        thumbnail: String((data.embed_thumbnail as string | undefined) || ''),
        image: String((data.embed_image as string | undefined) || ''),
        color: String((data.embed_color as string | undefined) || '#3DD68C'),
        timestamp: Boolean(data.embed_timestamp),
      });

      setLeaveEnabled(Boolean(data.goodbye_enabled));
      setLeaveChannel(String((data.goodbye_channel as string | undefined) || ''));
      setLeaveEmbed({
        embedMode: true,
        message: String((data.goodbye_message as string | undefined) || ''),
        title: String((data.goodbye_embed_title as string | undefined) || ''),
        author: String((data.goodbye_embed_author as string | undefined) || ''),
        authorIcon: String((data.goodbye_embed_author_icon as string | undefined) || ''),
        footer: String((data.goodbye_embed_footer as string | undefined) || ''),
        thumbnail: String((data.goodbye_embed_thumbnail as string | undefined) || ''),
        image: String((data.goodbye_embed_image as string | undefined) || ''),
        color: String((data.goodbye_embed_color as string | undefined) || '#ED4245'),
        timestamp: Boolean(data.goodbye_embed_timestamp),
      });

      setRejoinEnabled(Boolean(data.rejoin_enabled));
      setRejoinChannel(String((data.rejoin_channel_id as string | undefined) || ''));
      setRejoinMessage(String((data.rejoin_message as string | undefined) || ''));
      setRejoinColor(String((data.rejoin_embed_color as string | undefined) || '#FAA61A'));

      setDmEnabled(Boolean(data.dm_enabled));
      setDmMessage(String((data.dm_message as string | undefined) || ''));
      setDmEmbed(Boolean(data.dm_embed_enabled));
       const rawRoles = String((data.autorole_ids as string | undefined) || '');
       try {
         const parsed = JSON.parse(rawRoles);
         setAutoRoles(Array.isArray(parsed) ? parsed.map(String) : rawRoles.split(',').filter(Boolean));
       } catch {
         setAutoRoles(rawRoles.split(',').map(role => role.trim()).filter(Boolean));
       }
      setCardEnabled(Boolean(data.card_enabled));
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Could not load welcome settings', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, selectedGuildId]);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  const save = async () => {
    if (!selectedGuildId) {
      addToast('Select a server first', 'error');
      return;
    }

    try {
      setSaving(true);
      await apiPost(`/api/guild/${selectedGuildId}/welcome`, {
        enabled: welcomeEnabled ? 1 : 0,
        channel_id: welcomeChannel,
        message: welcomeEmbed.message,
        embed_enabled: welcomeEmbed.embedMode ? 1 : 0,
        embed_color: welcomeEmbed.color,
        embed_title: welcomeEmbed.title,
        embed_author: welcomeEmbed.author,
        embed_author_icon: welcomeEmbed.authorIcon,
        embed_footer: welcomeEmbed.footer,
        embed_thumbnail: welcomeEmbed.thumbnail,
        embed_image: welcomeEmbed.image,
        embed_timestamp: welcomeEmbed.timestamp ? 1 : 0,
        goodbye_enabled: leaveEnabled ? 1 : 0,
        goodbye_channel: leaveChannel,
        goodbye_message: leaveEmbed.message,
        goodbye_embed_color: leaveEmbed.color,
        goodbye_embed_title: leaveEmbed.title,
        goodbye_embed_author: leaveEmbed.author,
        goodbye_embed_author_icon: leaveEmbed.authorIcon,
        goodbye_embed_footer: leaveEmbed.footer,
        goodbye_embed_thumbnail: leaveEmbed.thumbnail,
        goodbye_embed_image: leaveEmbed.image,
        goodbye_embed_timestamp: leaveEmbed.timestamp ? 1 : 0,
        dm_enabled: dmEnabled ? 1 : 0,
        dm_message: dmMessage,
        dm_embed_enabled: dmEmbed ? 1 : 0,
        rejoin_enabled: rejoinEnabled ? 1 : 0,
        rejoin_channel_id: rejoinChannel,
        rejoin_message: rejoinMessage,
        rejoin_embed_color: rejoinColor,
         autorole_ids: JSON.stringify(autoRoles),
        card_enabled: cardEnabled ? 1 : 0,
      });
      addToast('Welcome settings saved', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Could not save welcome settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    if (!selectedGuildId) {
      addToast('Select a server first', 'error');
      return;
    }

    try {
      await apiPost(`/api/guild/${selectedGuildId}/welcome/test`);
      addToast('Test welcome sent', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Could not send test welcome', 'error');
    }
  };

  const addRole = () => {
    if (!roleSelect || autoRoles.includes(roleSelect) || autoRoles.length >= 5) return;
    setAutoRoles((current) => [...current, roleSelect]);
    setRoleSelect('');
  };

  const removeRole = (roleId: string) => setAutoRoles((current) => current.filter((item) => item !== roleId));

  const patchWelcome = useCallback((patch: Partial<EmbedSettings>) => {
    setWelcomeEmbed((current) => ({ ...current, ...patch }));
  }, []);
  const patchLeave = useCallback((patch: Partial<EmbedSettings>) => {
    setLeaveEmbed((current) => ({ ...current, ...patch }));
  }, []);

  const tabs = [
    { id: 'welcome', label: '👋 Welcome' },
    { id: 'leave', label: '👋 Leave' },
    { id: 'rejoin', label: '🔄 Re-join' },
    { id: 'dm', label: '✉️ DM on Join' },
    { id: 'autorole', label: '🎭 Auto-role' },
    { id: 'card', label: '🖼️ Image Card' },
  ] as const;

  return (
    <div className="flex flex-col gap-6 max-w-[960px] mx-auto animate-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-1">Welcome System</h1>
          <p className="text-[var(--text-muted)]">Configure welcome messages, goodbyes, re-join detection, DMs, auto-roles, and image cards.</p>
        </div>
         <Toggle on={enabled} onChange={(value) => { toggleModule('welcome'); setWelcomeEnabled(value); }} />
      </div>

      {loading && <div className="text-sm text-[var(--text-muted)]">Loading welcome settings…</div>}

      <div className={`flex flex-col gap-6 transition-opacity ${!enabled ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex gap-1 p-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-max px-4 py-2 rounded-md text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-[var(--surface-3)] text-[var(--text)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'welcome' && (
          <div className="flex flex-col gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Welcome messages</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">Send a message when someone joins your server.</div>
                </div>
                <Toggle on={welcomeEnabled} onChange={() => setWelcomeEnabled((current) => !current)} />
              </div>
            </Card>

            <Card>
              <div className="font-semibold mb-4">Channel &amp; message</div>
              <div className="flex flex-col gap-1.5 mb-5">
                <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">Welcome channel</label>
                <select value={welcomeChannel} onChange={(event) => setWelcomeChannel(event.target.value)} className="w-full max-w-xs">
                  <option value="">— choose a channel —</option>
                  {channelOptions.map((channel) => <option key={channel.id} value={channel.id}>{channel.name}</option>)}
                </select>
              </div>
              <EmbedBuilder embed={welcomeEmbed} onChange={patchWelcome} messageId="w-message" demoDesc="Welcome {user} to **{server}**! You're member #{membercount} 🎉" accentColor="#3DD68C" />
              <div className="flex gap-3 mt-6">
                <button className="btn-primary" onClick={() => void save()} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
                <button className="btn-secondary" onClick={() => void sendTest()}>Send test</button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'leave' && (
          <div className="flex flex-col gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Leave messages</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">Notify the server when someone leaves or is removed.</div>
                </div>
                <Toggle on={leaveEnabled} onChange={() => setLeaveEnabled((current) => !current)} />
              </div>
            </Card>

            <Card>
              <div className="font-semibold mb-4">Channel &amp; message</div>
              <div className="flex flex-col gap-1.5 mb-5">
                <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">Leave channel</label>
                <select value={leaveChannel} onChange={(event) => setLeaveChannel(event.target.value)} className="w-full max-w-xs">
                  <option value="">— choose a channel —</option>
                  {channelOptions.map((channel) => <option key={channel.id} value={channel.id}>{channel.name}</option>)}
                </select>
              </div>
              <EmbedBuilder embed={leaveEmbed} onChange={patchLeave} messageId="g-message" demoDesc="**{username}** has left the server. Members: {membercount}" accentColor="#ED4245" />
              <div className="flex gap-3 mt-6">
                <button className="btn-primary" onClick={() => void save()} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'rejoin' && (
          <div className="flex flex-col gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Re-join detection</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">Detect when someone rejoins and send a different message instead of the normal welcome.</div>
                </div>
                <Toggle on={rejoinEnabled} onChange={() => setRejoinEnabled((current) => !current)} />
              </div>
            </Card>

            <Card>
              <div className="font-semibold mb-4">Re-join message</div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">Re-join channel</label>
                  <select value={rejoinChannel} onChange={(event) => setRejoinChannel(event.target.value)} className="w-full max-w-xs">
                    <option value="">— same as welcome channel —</option>
                    {channelOptions.map((channel) => <option key={channel.id} value={channel.id}>{channel.name}</option>)}
                  </select>
                  <p className="text-xs text-[var(--text-muted)]">Leave blank to use the same channel as the regular welcome.</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">Message</label>
                  <textarea id="rj-message" value={rejoinMessage} onChange={(event) => setRejoinMessage(event.target.value)} rows={3} placeholder="Welcome back, {user}! Glad you're here again 👀 You were member #{join_position}." className="w-full resize-y text-sm" />
                  <PlaceholderChips targetId="rj-message" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">Embed color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={rejoinColor} onChange={(event) => setRejoinColor(event.target.value)} className="w-9 h-9 rounded cursor-pointer p-0.5 border border-[var(--border)] bg-[var(--surface-2)]" />
                    <input type="text" value={rejoinColor} onChange={(event) => setRejoinColor(event.target.value)} maxLength={7} className="w-28 font-mono text-xs" />
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-faint)] mb-3">Live Preview</div>
                  <DiscordPreview embed={{ embedMode: true, message: rejoinMessage || 'Welcome back, {user}! Glad you\'re here again 👀', title: '', author: '', authorIcon: '', footer: '', thumbnail: '', image: '', color: rejoinColor, timestamp: false }} demoDesc="Welcome back, {user}! You were member #{join_position}." accentInitial="#FAA61A" />
                </div>

                <button className="btn-primary w-fit" onClick={() => void save()} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'dm' && (
          <div className="flex flex-col gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">DM on join</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">Send a private message to every new member when they join.</div>
                </div>
                <Toggle on={dmEnabled} onChange={() => setDmEnabled((current) => !current)} />
              </div>
            </Card>

            <Card>
              <div className="font-semibold mb-4">DM content</div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">Message</label>
                  <textarea id="dm-message" value={dmMessage} onChange={(event) => setDmMessage(event.target.value)} rows={5} placeholder={`Hey {username}! Welcome to **{server}** 🎉\n\nMake sure to read our rules and enjoy your stay!`} className="w-full resize-y text-sm" />
                  <p className="text-xs text-[var(--text-muted)]">Supports the same placeholders as welcome messages.</p>
                  <PlaceholderChips targetId="dm-message" />
                </div>

                <div className="flex items-center justify-between py-2 border-t border-[var(--border-light)]">
                  <div>
                    <div className="text-sm font-semibold">Send as embed</div>
                    <div className="text-xs text-[var(--text-muted)]">Wrap the DM in a rich embed with your server icon</div>
                  </div>
                  <Toggle on={dmEmbed} onChange={() => setDmEmbed((current) => !current)} />
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-faint)] mb-3">Live Preview</div>
                  <DiscordPreview embed={{ embedMode: dmEmbed, message: dmMessage || 'Hey {username}! Welcome to **{server}** 🎉\n\nMake sure to read our rules and enjoy your stay!', title: '', author: '', authorIcon: '', footer: '', thumbnail: '', image: '', color: '#5B8DFF', timestamp: false }} demoDesc="Hey {username}! Welcome to **{server}** 🎉" accentInitial="#5B8DFF" />
                </div>

                <button className="btn-primary w-fit" onClick={() => void save()} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'autorole' && (
          <div className="flex flex-col gap-4">
            <Card>
              <div className="font-semibold mb-1">Auto-role on join</div>
              <div className="text-xs text-[var(--text-muted)] mb-5">Automatically assign up to 5 roles when a new member joins.</div>

              <div className="flex flex-col gap-1.5 mb-5">
                <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">Add role</label>
                <div className="flex gap-2">
                  <select value={roleSelect} onChange={(event) => setRoleSelect(event.target.value)} className="flex-1 max-w-xs">
                    <option value="">— pick a role —</option>
                    {roleOptions.filter((role) => !autoRoles.includes(role.id)).map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                  </select>
                  <button className="btn-secondary" onClick={addRole} disabled={!roleSelect || autoRoles.length >= 5}>Add</button>
                </div>
                {autoRoles.length >= 5 && <p className="text-xs text-[var(--amber)]">Maximum of 5 auto-roles reached.</p>}
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)] mb-2">Current auto-roles</div>
                {autoRoles.length === 0 ? (
                  <p className="text-sm text-[var(--text-faint)]">No auto-roles configured.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 min-h-[32px]">
                    {autoRoles.map((roleId) => {
                      const role = roleOptions.find((item) => item.id === roleId);
                      return (
                        <span key={roleId} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border" style={{ background: 'rgba(91,141,255,0.12)', borderColor: 'rgba(91,141,255,0.25)', color: 'var(--accent)' }}>
                          {role?.name || roleId}
                          <button onClick={() => removeRole(roleId)} className="opacity-60 hover:opacity-100 transition-opacity">
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <button className="btn-primary mt-6 w-fit" onClick={() => void save()} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            </Card>
          </div>
        )}

        {activeTab === 'card' && (
          <div className="flex flex-col gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Welcome image card</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">Generate a custom banner image with the member's avatar and username, automatically attached to the welcome embed.</div>
                </div>
                <Toggle on={cardEnabled} onChange={() => setCardEnabled((current) => !current)} />
              </div>
            </Card>

            <Card>
              <div className="font-semibold mb-1">Card preview</div>
              <div className="text-xs text-[var(--text-muted)] mb-5">This is a representation of the generated image. The actual image is created dynamically by the bot.</div>
              <div className="relative rounded-xl overflow-hidden border border-[var(--border)] flex items-center gap-7 px-9 py-8" style={{ background: 'linear-gradient(135deg, #0A0C14 0%, #131726 100%)' }}>
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.03) 39px,rgba(255,255,255,.03) 40px), repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.03) 39px,rgba(255,255,255,.03) 40px)` }} />
                <div className="relative z-10 w-24 h-24 rounded-full border-[3px] border-white flex-shrink-0 flex items-center justify-center text-4xl" style={{ background: 'rgba(91,141,255,.2)' }}>🙂</div>
                <div className="relative z-10 w-1 h-16 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(180deg, #5B8DFF, #3DD68C)' }} />
                <div className="relative z-10">
                  <div className="text-[11px] tracking-[.12em] uppercase text-white/50 mb-1">WELCOME</div>
                  <div className="text-3xl font-display font-bold text-white tracking-tight">Username</div>
                  <div className="text-sm mt-1" style={{ color: 'rgba(200,210,240,.7)' }}>Member #1,042</div>
                </div>
              </div>
              <p className="text-xs text-[var(--text-faint)] mt-3">The card is automatically attached to the welcome embed when image cards are enabled.</p>
              <button className="btn-primary mt-5 w-fit" onClick={() => void save()} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
