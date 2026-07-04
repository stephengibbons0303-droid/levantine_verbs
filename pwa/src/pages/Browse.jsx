import { useState, useMemo } from 'react';
import VerbCard from '../components/VerbCard';
import VerbDetail from './VerbDetail';
import dabkeDark from '../assets/dabke-dark.svg';
import dabkeLight from '../assets/dabke-light.svg';

const DIFFICULTY_TIERS = ['all', 'A', 'B', 'C', 'D', 'E'];
const TIER_HEX = {
  A: 'var(--tier-a)',
  B: 'var(--tier-b)',
  C: 'var(--tier-c)',
  D: 'var(--tier-d)',
  E: 'var(--tier-e)',
};

const toArabicDigits = (n) =>
  String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);

function ThemeIcon({ theme }) {
  // dark mode shows a sun (tap → light); light mode shows a moon (tap → dark)
  if (theme === 'dark') {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <circle cx="9" cy="9" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const r = (a * Math.PI) / 180;
          const x1 = 9 + Math.cos(r) * 5.6;
          const y1 = 9 + Math.sin(r) * 5.6;
          const x2 = 9 + Math.cos(r) * 7.6;
          const y2 = 9 + Math.sin(r) * 7.6;
          return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />;
        })}
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M15 11.2A6.2 6.2 0 0 1 6.8 3 6.2 6.2 0 1 0 15 11.2z" fill="currentColor" />
    </svg>
  );
}

export default function Browse({ verbs, theme = 'dark', onToggleTheme }) {
  const [measureFilter, setMeasureFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const measures = useMemo(() => [...new Set(verbs.filter(v => v.classification).map(v => v.classification.measure))].sort(), [verbs]);
  const types = useMemo(() => [...new Set(verbs.filter(v => v.classification).map(v => v.classification.type))].sort(), [verbs]);

  const filtered = useMemo(() => {
    return verbs.filter(v => {
      if (measureFilter !== 'all' && v.classification?.measure !== measureFilter) return false;
      if (typeFilter !== 'all' && v.classification?.type !== typeFilter) return false;
      if (difficultyFilter !== 'all') {
        const d = v.difficulty;
        // BA treated as B for filtering
        if (difficultyFilter === 'B') {
          if (d !== 'B' && d !== 'BA') return false;
        } else {
          if (d !== difficultyFilter) return false;
        }
      }
      if (search) {
        const s = search.toLowerCase();
        return (
          v.verb.translit.toLowerCase().includes(s) ||
          v.verb.english.toLowerCase().includes(s) ||
          v.verb.arabic.includes(search)
        );
      }
      return true;
    });
  }, [verbs, measureFilter, typeFilter, difficultyFilter, search]);

  if (selected) {
    return <VerbDetail verb={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="sn-browse">
      <div className="sn-topline">
        <span className="sn-wordmark">Levantine Verbs</span>
        <button
          className="sn-theme-toggle"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          <ThemeIcon theme={theme} />
        </button>
      </div>

      <div className="sn-hero">
        <img className="sn-emblem" src={theme === 'dark' ? dabkeDark : dabkeLight} alt="" aria-hidden="true" />
        <h1 className="sn-hero-title" dir="rtl">الأفعال</h1>
        <div className="sn-hero-count" dir="ltr">
          <span dir="rtl">{toArabicDigits(filtered.length)} فعل</span> · {filtered.length} verbs
        </div>
      </div>

      <div className="sn-search">
        <span className="sn-search-ico" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search a verb or root…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search verbs"
        />
      </div>

      <div className="sn-filter-row">
        <div className="sn-select">
          <select value={measureFilter} onChange={e => setMeasureFilter(e.target.value)} aria-label="Filter by measure">
            <option value="all">All measures</option>
            {measures.map(m => <option key={m} value={m}>Measure {m}</option>)}
          </select>
        </div>
        <div className="sn-select">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} aria-label="Filter by type">
            <option value="all">All types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="sn-tiers">
        {DIFFICULTY_TIERS.map(tier => {
          const active = difficultyFilter === tier;
          if (tier === 'all') {
            return (
              <button
                key={tier}
                className={`sn-chip all ${active ? 'active' : ''}`}
                onClick={() => setDifficultyFilter('all')}
              >
                All
              </button>
            );
          }
          return (
            <button
              key={tier}
              className={`sn-chip tier ${active ? 'active' : ''}`}
              style={active
                ? { background: TIER_HEX[tier], borderColor: TIER_HEX[tier], color: 'var(--tier-text)' }
                : { color: TIER_HEX[tier] }}
              onClick={() => setDifficultyFilter(tier)}
            >
              {tier}
            </button>
          );
        })}
      </div>

      <div className="sn-verb-list">
        {filtered.map((v, i) => <VerbCard key={v.id} verb={v} num={i + 1} onOpen={setSelected} />)}
      </div>
    </div>
  );
}
