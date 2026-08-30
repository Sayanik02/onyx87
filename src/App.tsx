import React from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Layout } from './components/Layout';
import { ModulesProvider } from './context/ModulesContext';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { ToastProvider } from './components/Toast';

import { Overview } from './pages/Overview';
import { Modules } from './pages/Modules';
import { Antinuke } from './pages/Antinuke';
import { Backups } from './pages/Backups';
import { Tickets } from './pages/Tickets';
import { Welcome } from './pages/Welcome';
import { AutoReact } from './pages/AutoReact';
import { Moderation } from './pages/Moderation';
import { Leveling } from './pages/Leveling';
import { Logging } from './pages/Logging';
import { Premium } from './pages/Premium';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <h1 className="text-4xl font-bold font-display text-[var(--text)] mb-2">404</h1>
      <p className="text-[var(--text-muted)]">Page not found</p>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Overview} />
      <Route path="/guilds" component={Overview} />
      <Route path="/modules" component={Modules} />
      <Route path="/antinuke" component={Antinuke} />
      <Route path="/backups" component={Backups} />
      <Route path="/tickets" component={Tickets} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/autoreact" component={AutoReact} />
      <Route path="/moderation" component={Moderation} />
      <Route path="/leveling" component={Leveling} />
      <Route path="/logging" component={Logging} />
      <Route path="/premium" component={Premium} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, login } = useDashboard();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text)]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-8 py-6 shadow-2xl">
          <p className="text-lg font-semibold">Connecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-6">
        <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">Onyx Dashboard</p>
          <h1 className="mt-3 text-3xl font-display font-bold">Secure access with Discord</h1>
          <p className="mt-3 text-sm text-[var(--text-muted)]">Sign in with your Discord account to manage your bot, guild settings, and modules from the new dashboard.</p>
          <button
            onClick={login}
            className="mt-6 w-full rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          >
            Connect Discord
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <DashboardProvider>
      <ModulesProvider>
        <ToastProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AuthGate>
              <Layout>
                <Router />
              </Layout>
            </AuthGate>
          </WouterRouter>
        </ToastProvider>
      </ModulesProvider>
    </DashboardProvider>
  );
}

export default App;
