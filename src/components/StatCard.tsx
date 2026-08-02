import React, { ReactNode } from 'react';
import { Card } from './Card';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  color?: string;
  trend?: ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color = 'var(--accent)', trend }) => {
  return (
    <Card className="flex flex-col gap-4 animate-in">
      <div className="flex justify-between items-start">
        <div 
          className="p-3 rounded-lg flex items-center justify-center"
          style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
        >
          {icon}
        </div>
        {trend && <div className="text-sm font-medium">{trend}</div>}
      </div>
      <div>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</div>
        <div className="text-2xl font-mono mt-1" style={{ color: 'var(--text)' }}>{value}</div>
      </div>
    </Card>
  );
};
