import { useState } from 'react';
import { GameProvider, useGame } from './store/gameStore';
import TopBar from './components/TopBar';
import TabBar from './components/TabBar';
import BusinessPage from './pages/BusinessPage';
import InvestmentsPage from './pages/InvestmentsPage';
import EarnPage from './pages/EarnPage';
import ExclusivePage from './pages/ExclusivePage';
import AccountPage from './pages/AccountPage';

function GameShell() {
  const state = useGame();
  const [tab, setTab] = useState('business');

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-400">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <TopBar />

      <main className="mx-auto max-w-5xl px-4 pb-32 pt-24">
        <div key={tab} className="tab-content-animation">
          {tab === 'business' && <BusinessPage />}
          {tab === 'investments' && <InvestmentsPage />}
          {tab === 'earn' && <EarnPage />}
          {tab === 'exclusive' && <ExclusivePage />}
          {tab === 'account' && <AccountPage />}
        </div>
      </main>

      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  );
}