import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost, getApiBaseUrl, getStoredSessionToken, setStoredSessionToken } from '../lib/api';

interface DashboardUser {
  user_id: string;
  username: string;
  avatar: string;
  guilds: Array<{ id: string; name: string; icon?: string | null; bot_in?: boolean }>;
}

interface DashboardStats {
  members: number;
  modActions: number;
  warns: number;
  openTickets: number;
  antinukeOn: boolean;
  autoReactRules: number;
  recentActions: Array<Record<string, unknown>>;
  guildId: string;
  guildName: string;
  guildIcon?: string | null;
  isPremium: boolean;
}

interface GuildInfo {
  channels: Array<{ id: string; name: string }>;
  roles: Array<{ id: string; name: string; color: number; managed: boolean }>;
}

interface DashboardContextValue {
  user: DashboardUser | null;
  loading: boolean;
  error: string | null;
  selectedGuildId: string | null;
  selectedGuild: { id: string; name: string; icon?: string | null; bot_in?: boolean } | null;
  stats: DashboardStats | null;
  guildInfo: GuildInfo | null;
  login: () => void;
  logout: () => void;
  selectGuild: (guildId: string) => void;
  refresh: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null);

  const selectedGuild = useMemo(() => {
    return user?.guilds.find((guild) => guild.id === selectedGuildId) || null;
  }, [selectedGuildId, user]);

  const loadUser = async () => {
    const token = getStoredSessionToken();
    if (!token) {
      setUser(null);
      setSelectedGuildId(null);
      setStats(null);
      setGuildInfo(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiGet<DashboardUser>('/auth/me');
      setUser(data);
      if (!selectedGuildId && data.guilds.length > 0) {
        const firstGuild = data.guilds.find((guild) => guild.bot_in) || data.guilds[0];
        setSelectedGuildId(firstGuild?.id || null);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard session');
      setStoredSessionToken(null);
      setUser(null);
      setSelectedGuildId(null);
      setStats(null);
      setGuildInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hash = window.location.hash || '';
    const tokenMatch = hash.match(/token=([^&]+)/);
    if (tokenMatch?.[1]) {
      const token = decodeURIComponent(tokenMatch[1]);
      setStoredSessionToken(token);
      window.history.replaceState({}, '', window.location.pathname + window.location.search);
    }

    void loadUser();
  }, []);

  useEffect(() => {
    if (!selectedGuildId || !user) {
      setStats(null);
      setGuildInfo(null);
      return;
    }

    let cancelled = false;

    const loadStats = async () => {
      try {
        const data = await apiGet<DashboardStats>(`/api/guild/${selectedGuildId}/stats`);
        if (!cancelled) {
          setStats(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load guild stats');
        }
      }
    };

    const loadGuildInfo = async () => {
      try {
        const data = await apiGet<GuildInfo>(`/api/guild/${selectedGuildId}/guild`);
        if (!cancelled) {
          setGuildInfo(data);
        }
      } catch {
        if (!cancelled) {
          setGuildInfo(null);
        }
      }
    };

    void loadStats();
    void loadGuildInfo();

    return () => {
      cancelled = true;
    };
  }, [selectedGuildId, user]);

  const login = () => {
    window.location.assign(`${getApiBaseUrl()}/auth/login`);
  };

  const logout = async () => {
    try {
      await apiPost('/auth/logout');
    } catch {
      // no-op
    } finally {
      setStoredSessionToken(null);
      setUser(null);
      setSelectedGuildId(null);
      setStats(null);
      setGuildInfo(null);
      window.location.assign('/');
    }
  };

  const selectGuild = (guildId: string) => {
    setSelectedGuildId(guildId);
  };

  const refresh = async () => {
    setLoading(true);
    await loadUser();
  };

  const value = useMemo<DashboardContextValue>(() => ({
    user,
    loading,
    error,
    selectedGuildId,
    selectedGuild,
    stats,
    guildInfo,
    login,
    logout,
    selectGuild,
    refresh,
  }), [user, loading, error, selectedGuildId, selectedGuild, stats, guildInfo]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};
