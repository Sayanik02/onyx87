import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Toggle } from '../components/Toggle';
import { useToast } from '../components/Toast';
import { useModules } from '../context/ModulesContext';

export const Logging: React.FC = () => {
  const { enabledModules, toggleModule } = useModules();
  const enabled = enabledModules['logging'];
  const { addToast } = useToast();

  const [channel, setChannel] = useState('1098234710923847');
  
  const events = [
    { cat: 'Messages', items: ['Message Delete', 'Message Edit'] },
    { cat: 'Members', items: ['Member Join', 'Member Leave', 'Member Ban', 'Member Kick', 'Nickname Change'] },
    { cat: 'Server', items: ['Role Create', 'Role Delete', 'Channel Create', 'Channel Delete', 'Server Update'] },
    { cat: 'Voice', items: ['Voice Join', 'Voice Leave'] },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[900px] mx-auto animate-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Audit Logging</h1>
          <p className="text-[var(--text-muted)]">Track everything that happens in your server.</p>
        </div>
        <Toggle on={enabled} onChange={() => toggleModule('logging')} />
      </div>

      <Card className={!enabled ? 'opacity-50 pointer-events-none' : ''}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-lg mb-1">Master Log Channel</h3>
            <p className="text-sm text-[var(--text-muted)]">Where should Onyx send the logs?</p>
          </div>
          <input type="text" value={channel} onChange={e => setChannel(e.target.value)} className="w-48 font-mono text-xs" />
        </div>
      </Card>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {events.map(group => (
          <Card key={group.cat} noPadding>
            <div className="p-4 bg-[var(--surface-2)] border-b border-[var(--border)] rounded-t-[var(--radius)]">
              <h3 className="font-bold text-sm text-[var(--text)] uppercase tracking-wider">{group.cat}</h3>
            </div>
            <div className="p-2">
              {group.items.map(item => (
                <div key={item} className="flex items-center justify-between p-3 hover:bg-[var(--surface-2)] rounded-lg transition-colors">
                  <span className="text-sm font-medium text-[var(--text)]">{item}</span>
                  <Toggle on={true} onChange={() => addToast('Event toggled')} />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
