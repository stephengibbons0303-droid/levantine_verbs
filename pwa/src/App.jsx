import { useState } from 'react';
import { useVerbs } from './hooks/useVerbs';
import Browse from './pages/Browse';
import Quiz from './pages/Quiz';
import TranslitDrawer from './components/TranslitDrawer';
import './App.css';

const TABS = [
  { id: 'browse', label: 'Browse', icon: '\uD83D\uDCDA' },
  { id: 'quiz', label: 'Quiz', icon: '\uD83C\uDFAF' },
];

export default function App() {
  const [tab, setTab] = useState('browse');
  const { verbs, loading } = useVerbs();

  if (loading) {
    return <div className="loading">Loading verbs...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Levantine Verbs</h1>
      </header>

      <main className="app-main">
        {tab === 'browse' && <Browse verbs={verbs} />}
        {tab === 'quiz' && <Quiz verbs={verbs} />}
      </main>

      <nav className="bottom-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>

      <TranslitDrawer />
    </div>
  );
}
