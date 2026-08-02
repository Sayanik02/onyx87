import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-[var(--bg)] w-full overflow-hidden text-[var(--text)]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto w-full">
          <div className="w-full max-w-[1100px] mx-auto p-8 animate-in pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
