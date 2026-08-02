import React from 'react';

interface ToggleProps {
  on: boolean;
  onChange: (on: boolean) => void;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ on, onChange, disabled }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: on ? 'var(--accent)' : 'var(--surface-3)',
        border: 'none',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.2s ease',
        flexShrink: 0
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          background: '#fff',
          position: 'absolute',
          top: 2,
          left: 2,
          transform: on ? 'translateX(20px)' : 'translateX(0)',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      />
    </button>
  );
};
