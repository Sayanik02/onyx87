import React, { ReactNode } from 'react';

interface SettingRowProps {
  label: string;
  hint?: string;
  control: ReactNode;
  children?: ReactNode;
}

export const SettingRow: React.FC<SettingRowProps> = ({ label, hint, control, children }) => {
  return (
    <div className="flex flex-col gap-4 py-4 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="font-semibold" style={{ color: 'var(--text)' }}>{label}</span>
          {hint && <span className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{hint}</span>}
        </div>
        <div>
          {control}
        </div>
      </div>
      {children && (
        <div className="pt-2">
          {children}
        </div>
      )}
    </div>
  );
};
