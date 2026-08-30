import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDashboard } from './DashboardContext';
import { apiGet, apiPost } from '../lib/api';

export type ModuleId = 
  | 'antinuke' | 'backups' | 'automod' 
  | 'tickets' | 'welcome' | 'leave' | 'autoreact' | 'joindm'
  | 'leveling' | 'economy' | 'counting'
  | 'logging' | 'reactionroles' | 'autorole' | 'birthdays';

interface ModulesContextType {
  enabledModules: Record<ModuleId, boolean>;
  toggleModule: (id: ModuleId) => void;
  isModuleEnabled: (id: ModuleId) => boolean;
}

const DEFAULT_MODULES: Record<ModuleId, boolean> = {
  antinuke: false,
  backups: true,
  automod: false,
  tickets: false,
  welcome: false,
  leave: true,
  autoreact: true,
  joindm: true,
  leveling: false,
  economy: false,
  counting: true,
  logging: false,
  reactionroles: true,
  autorole: true,
  birthdays: false,
};

const ModulesContext = createContext<ModulesContextType | null>(null);

export const ModulesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedGuildId } = useDashboard();
  const [enabledModules, setEnabledModules] = useState<Record<ModuleId, boolean>>(DEFAULT_MODULES);

  useEffect(() => {
    if (!selectedGuildId) {
      setEnabledModules(DEFAULT_MODULES);
      return;
    }
    apiGet<{ modules: Partial<Record<ModuleId, boolean>> }>(`/api/guild/${selectedGuildId}/modules`)
      .then(data => setEnabledModules({ ...DEFAULT_MODULES, ...(data.modules || {}) }))
      .catch(() => setEnabledModules(DEFAULT_MODULES));
  }, [selectedGuildId]);

  const toggleModule = (id: ModuleId) => {
    if (!selectedGuildId) return;
    setEnabledModules(prev => {
      const next = { ...prev, [id]: !prev[id] };
      void apiPost(`/api/guild/${selectedGuildId}/modules`, { modules: { [id]: next[id] } });
      return next;
    });
  };

  const isModuleEnabled = (id: ModuleId) => !!enabledModules[id];

  return (
    <ModulesContext.Provider value={{ enabledModules, toggleModule, isModuleEnabled }}>
      {children}
    </ModulesContext.Provider>
  );
};

export const useModules = () => {
  const ctx = useContext(ModulesContext);
  if (!ctx) throw new Error('useModules must be used within ModulesProvider');
  return ctx;
};
