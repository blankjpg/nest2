import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NestProvider } from './context/NestContext';
import { EmailProvider, useEmail } from './context/EmailContext';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { OnboardingGate } from './components/OnboardingGate';
import { Dashboard } from './pages/Dashboard';
import { WeekSummaryPage } from './pages/WeekSummaryPage';
import { SavingsPotPage } from './pages/SavingsPotPage';
import { SettingsPage } from './pages/SettingsPage';

const AppShell: React.FC = () => {
  const { hasOnboarded } = useEmail();

  if (!hasOnboarded) {
    return <OnboardingGate />;
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-white">
      <Header />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/summary" element={<WeekSummaryPage />} />
          <Route path="/savings" element={<SavingsPotPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <NestProvider>
      <EmailProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </EmailProvider>
    </NestProvider>
  );
};

export default App;
