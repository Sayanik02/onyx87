import React from 'react';
import { Toggle } from './Toggle';
import { Badge } from './Badge';
import { Link } from 'wouter';
import { Shield, Database, ShieldAlert, Ticket, UserPlus, UserMinus, Zap, MessageSquare, Award, Coins, Hash, FileText, UserCheck, Cake } from 'lucide-react';
import { ModuleId } from '../context/ModulesContext';

interface ModuleCardProps {
  id: ModuleId;
  name: string;
  description: string;
  category: 'protection' | 'engagement' | 'community' | 'utility';
  isPremium?: boolean;
  isNew?: boolean;
  enabled: boolean;
  onToggle: (id: ModuleId) => void;
  configPath?: string;
}

const getCategoryIcon = (id: ModuleId) => {
  switch (id) {
    case 'antinuke': return <Shield size={20} />;
    case 'backups': return <Database size={20} />;
    case 'automod': return <ShieldAlert size={20} />;
    case 'tickets': return <Ticket size={20} />;
    case 'welcome': return <UserPlus size={20} />;
    case 'leave': return <UserMinus size={20} />;
    case 'autoreact': return <Zap size={20} />;
    case 'joindm': return <MessageSquare size={20} />;
    case 'leveling': return <Award size={20} />;
    case 'economy': return <Coins size={20} />;
    case 'counting': return <Hash size={20} />;
    case 'logging': return <FileText size={20} />;
    case 'reactionroles': return <UserCheck size={20} />;
    case 'autorole': return <UserPlus size={20} />;
    case 'birthdays': return <Cake size={20} />;
    default: return <Zap size={20} />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'protection': return 'var(--accent)';
    case 'engagement': return 'var(--green)';
    case 'community': return 'var(--amber)';
    case 'utility': return '#A78BFA'; // Purple
    default: return 'var(--text-faint)';
  }
};

export const ModuleCard: React.FC<ModuleCardProps> = ({
  id, name, description, category, isPremium, isNew, enabled, onToggle, configPath
}) => {
  const color = getCategoryColor(category);

  return (
    <div 
      className="flex items-center gap-4 p-5 rounded-xl border transition-all duration-300"
      style={{
        background: 'var(--surface)',
        borderColor: enabled ? 'var(--border)' : 'var(--border-light)',
        opacity: enabled ? 1 : 0.8,
        boxShadow: enabled ? `inset 2px 0 0 ${color}` : 'none',
      }}
    >
      <div 
        className="w-12 h-12 flex items-center justify-center rounded-lg flex-shrink-0"
        style={{ 
          background: enabled ? `color-mix(in srgb, ${color} 15%, transparent)` : 'var(--surface-3)',
          color: enabled ? color : 'var(--text-faint)',
          transition: 'all 0.3s ease'
        }}
      >
        {getCategoryIcon(id)}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold font-display text-base truncate" style={{ color: enabled ? 'var(--text)' : 'var(--text-muted)' }}>
            {name}
          </h3>
          {isPremium && <Badge variant="premium">Premium</Badge>}
          {isNew && <Badge variant="new">New</Badge>}
        </div>
        <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>
          {description}
        </p>
        {!enabled && (
          <span className="text-[10px] mt-1 uppercase tracking-wider font-semibold" style={{ color: 'var(--amber)' }}>
            Hidden from !help
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        {configPath ? (
          <Link href={configPath} className={`text-sm font-medium transition-colors ${enabled ? 'hover:underline' : 'opacity-50 pointer-events-none'}`} style={{ color: enabled ? 'var(--text)' : 'var(--text-faint)' }}>
            Configure →
          </Link>
        ) : (
          <span className="text-sm font-medium opacity-50" style={{ color: 'var(--text-faint)' }}>
            No config
          </span>
        )}
        <Toggle on={enabled} onChange={() => onToggle(id)} />
      </div>
    </div>
  );
};
