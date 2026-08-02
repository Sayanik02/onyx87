import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style, noPadding }) => {
  return (
    <div
      className={className}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: noPadding ? 0 : '24px',
        ...style
      }}
    >
      {children}
    </div>
  );
};
