import React, { ReactNode } from 'react';

interface BadgeProps {
  variant: 'active' | 'inactive' | 'premium' | 'new' | 'default';
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, className = '', style }) => {
  let bg, color, border;
  
  switch (variant) {
    case 'active':
      bg = 'var(--green-dim)';
      color = 'var(--green)';
      border = '1px solid rgba(61, 214, 140, 0.2)';
      break;
    case 'inactive':
      bg = 'rgba(245, 166, 35, 0.1)';
      color = 'var(--amber)';
      border = '1px solid rgba(245, 166, 35, 0.2)';
      break;
    case 'premium':
      bg = 'linear-gradient(90deg, rgba(245, 166, 35, 0.15) 0%, rgba(245, 166, 35, 0.05) 100%)';
      color = 'var(--amber)';
      border = '1px solid rgba(245, 166, 35, 0.3)';
      break;
    case 'new':
      bg = 'var(--accent-dim)';
      color = 'var(--accent)';
      border = '1px solid var(--accent-border)';
      break;
    default:
      bg = 'var(--surface-3)';
      color = 'var(--text-muted)';
      border = '1px solid var(--border)';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded whitespace-nowrap ${className}`}
      style={{ background: bg, color, border, ...style }}
    >
      {children}
    </span>
  );
};
