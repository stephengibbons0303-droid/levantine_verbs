import { useState, useMemo } from 'react';
import VerbCard from '../components/VerbCard';

export default function Browse({ verbs }) {
  const [measureFilter, setMeasureFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const measures = useMemo(() => [...new Set(verbs.map(v => v.classification.measure))].sort(), [verbs]);
  const types = useMemo(() => [...new Set(verbs.map(v => v.classification.type))].sort(), [verbs]);

  const filtered = useMemo(() => {
    return verbs.filter(v => {
      if (measureFilter !== 'all' && v.classification.measure !== measureFilter) return false;
      if (typeFilter !== 'all' && v.classification.type !== typeFilter) return false;
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
  }, [verbs, measureFilter, typeFilter, search]);

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
      </div>
      <div className="verb-count">{filtered.length} verb{filtered.length !== 1 ? 's' : ''}</div>
      <div className="verb-list">
        {filtered.map(v => <VerbCard key={v.id} verb={v} />)}
      </div>
    </div>
  );
}
