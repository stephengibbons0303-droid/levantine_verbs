import { useState, useEffect } from 'react';
import { useVerbs } from './hooks/useVerbs';
import Browse from './pages/Browse';
import Quiz from './pages/Quiz';
import SRSDashboard from './pages/SRSDashboard';
import Dialogues from './pages/Dialogues';
import TranslitDrawer from './components/TranslitDrawer';
import './App.css';

const TABS = [
  { id: 'browse', label: 'Browse' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'talk', label: 'Talk' },
  { id: 'srs', label: 'FSRS' },
];

// Geometric nav marks (Sanober) — colored via currentColor so active = red.
function NavIcon({ id }) {
  switch (id) {
    case 'browse':
      return (
        <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
          <rect x="0" y="0" width="20" height="2" rx="1" fill="currentColor" />
          <rect x="0" y="6" width="20" height="2" rx="1" fill="currentColor" />
          <rect x="0" y="12" width="14" height="2" rx="1" fill="currentColor" />
        </svg>
      );
    case 'quiz':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <circle cx="9" cy="9" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="9" cy="9" r="2.5" fill="currentColor" />
        </svg>
      );
    case 'srs':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <rect x="0" y="11" width="3" height="7" rx="1" fill="currentColor" />
          <rect x="7.5" y="6" width="3" height="12" rx="1" fill="currentColor" />
          <rect x="15" y="1" width="3" height="17" rx="1" fill="currentColor" />
        </svg>
      );
    case 'talk':
      return (
        <svg width="20" height="18" viewBox="0 0 20 18" aria-hidden="true">
          <path
            d="M2 2h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6l-4 4V3a1 1 0 0 1 1-1z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

export default function App() {
  const [tab, setTab] = useState('browse');
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('sanober-theme') || 'dark';
    } catch {
      return 'dark';
    }
  });
  const { verbs, loading } = useVerbs();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('sanober-theme', theme);
    } catch {
      /* private mode / storage blocked — theme just won't persist */
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  if (loading) {
    return <div className="loading">Loading verbs...</div>;
  }

  return (
    <div className="app">
      <main className="app-main">
        {tab === 'browse' && <Browse verbs={verbs} theme={theme} onToggleTheme={toggleTheme} />}
        {tab === 'quiz' && <Quiz verbs={verbs} />}
        {tab === 'srs' && <SRSDashboard verbs={verbs} />}
        {tab === 'talk' && <Dialogues />}
      </main>

      <nav className="bottom-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`nav-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="nav-ico">
              <NavIcon id={t.id} />
            </span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>

      <TranslitDrawer />
    </div>
  );
}
