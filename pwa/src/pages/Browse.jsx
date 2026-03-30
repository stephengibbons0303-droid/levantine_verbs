import { useState, useMemo } from 'react';
import VerbCard from '../components/VerbCard';

const DIFFICULTY_TIERS = ['all', 'A', 'B', 'C', 'D', 'E'];
const TIER_COLORS = { A: '#0c6', B: '#0af', BA: '#0af', C: '#f90', D: '#f44', E: '#a0a' };

export default function Browse({ verbs }) {
  const [measureFilter, setMeasureFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [search, setSearch] = useState('');

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

  return (
    <div className="page browse-page">
      <div className="filters">
        <input
          type="text"
          placeholder="Search verbs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="filter-row">
          <select value={measureFilter} onChange={e => setMeasureFilter(e.target.value)}>
            <option value="all">All measures</option>
            {measures.map(m => <option key={m} value={m}>Measure {m}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="chip-group tier-filter">
          {DIFFICULTY_TIERS.map(tier => (
            <button
              key={tier}
              className={`chip ${difficultyFilter === tier ? 'active' : ''}`}
              style={difficultyFilter === tier && tier !== 'all'
                ? { borderColor: TIER_COLORS[tier], background: TIER_COLORS[tier], color: '#fff' }
                : tier !== 'all' ? { borderColor: TIER_COLORS[tier], color: TIER_COLORS[tier] } : {}
              }
              onClick={() => setDifficultyFilter(tier)}
            >
              {tier === 'all' ? 'All tiers' : `Tier ${tier}`}
            </button>
          ))}
        </div>
      </div>
      <div className="verb-count">{filtered.length} verb{filtered.length !== 1 ? 's' : ''}</div>
      <div className="verb-list">
        {filtered.map(v => <VerbCard key={v.id} verb={v} />)}
      </div>
    </div>
  );
}
