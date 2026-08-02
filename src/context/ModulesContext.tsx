import React, { createContext, useContext, useState, useEffect } from 'react';

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
  antinuke: true,
  backups: true,
  automod: true,
  tickets: true,
  welcome: true,
  leave: true,
  autoreact: true,
  joindm: true,
  leveling: true,
  economy: false,
  counting: true,
  logging: true,
  reactionroles: true,
  autorole: true,
  birthdays: false,
};

const ModulesContext = createContext<ModulesContextType | null>(null);

export const ModulesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabledModules, setEnabledModules] = useState<Record<ModuleId, boolean>>(() => {
    try {
      const stored = localStorage.getItem('onyx_modules');
      if (stored) {
        return { ...DEFAULT_MODULES, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to parse modules', e);
    }
    return DEFAULT_MODULES;
  });

  useEffect(() => {
    localStorage.setItem('onyx_modules', JSON.stringify(enabledModules));
  }, [enabledModules]);

  const toggleModule = (id: ModuleId) => {
    setEnabledModules(prev => ({ ...prev, [id]: !prev[id] }));
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
