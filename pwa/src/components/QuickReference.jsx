import { TIME_ADVERBS, OBJECTS, ACTIVITIES, FAMILY_CONJUGATIONS, POSSESSIVE_LABELS, PEOPLE_NOUNS } from '../utils/vocabPool';
import PlayButton from './PlayButton';

const TIME_SECTIONS = [
  { key: 'past', label: 'Past' },
  { key: 'present', label: 'Present' },
  { key: 'future', label: 'Future' },
  { key: 'imperative', label: 'Command' },
];

function VocabTable({ items }) {
  return (
    <div className="qr-entries">
      {items.map((item, i) => (
        <div key={i} className="qr-entry">
          <div className="qr-entry-top">
            {item.arabic ? (
              <span className="qr-entry-ar" dir="rtl">{item.arabic}</span>
            ) : (
              <span className="qr-entry-tr headword">{item.translit}</span>
            )}
            {item.arabic && (
              <PlayButton text={item.arabic} size="sm" label={`Hear ${item.translit}`} />
            )}
          </div>
          <div className="qr-entry-sub">
            {item.arabic && <span className="qr-entry-tr">{item.translit}</span>}
            {item.arabic && item.english && <span className="qr-entry-sep">·</span>}
            {item.english && <span className="qr-entry-en">{item.english}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ConjugationTable({ entry }) {
  return (
    <div className="conjugation-block">
      <h4>{entry.base}</h4>
      <table className="qr-table">
        <tbody>
          {POSSESSIVE_LABELS.map((label, i) => (
            <tr key={i}>
              <td className="qr-english">{label}</td>
              <td className="qr-translit">{entry.forms[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CollapsibleSection({ id, title, collapsed, onToggle, hidden, children }) {
  if (hidden) return null;
  const isCollapsed = collapsed[id] !== false; // default collapsed
  return (
    <div className="collapsible-section">
      <h3 className="qr-heading collapsible-heading" onClick={() => onToggle(id)}>
        <span className="collapse-chevron">{isCollapsed ? '▸' : '▾'}</span>
        {title}
      </h3>
      {!isCollapsed && children}
    </div>
  );
}

function matchesSearch(text, term) {
  return text && text.toLowerCase().includes(term);
}

function filterItems(items, term) {
  if (!term) return items;
  return items.filter(item =>
    matchesSearch(item.translit, term) ||
    matchesSearch(item.english, term) ||
    matchesSearch(item.arabic, term)
  );
}

function familyMatchesSearch(entry, term) {
  if (!term) return true;
  if (matchesSearch(entry.base, term)) return true;
  return entry.forms.some(f => matchesSearch(f, term));
}

export default function QuickReference({ searchTerm, collapsed, onToggleSection }) {
  const term = (searchTerm || '').toLowerCase();
  const isSearching = term.length > 0;

  // Filter time adverbs by section
  const filteredTime = TIME_SECTIONS.map(({ key, label }) => {
    const items = filterItems(TIME_ADVERBS[key], term);
    return { key, label, items };
  }).filter(s => s.items.length > 0);

  const filteredObjects = filterItems(OBJECTS, term);
  const filteredActivities = filterItems(ACTIVITIES, term);
  const filteredPeopleNouns = filterItems(PEOPLE_NOUNS, term);
  const filteredFamily = FAMILY_CONJUGATIONS.filter(e => familyMatchesSearch(e, term));

  const hasTimeMatches = filteredTime.length > 0;
  const hasObjectMatches = filteredObjects.length > 0;
  const hasPeopleMatches = filteredFamily.length > 0 || filteredPeopleNouns.length > 0;
  const hasActivityMatches = filteredActivities.length > 0;

  // When searching, force-expand sections with matches
  const getCollapsed = (id, hasMatches) => {
    if (isSearching) return { ...collapsed, [id]: !hasMatches };
    return collapsed;
  };

  return (
    <div className="quick-reference">
      <CollapsibleSection
        id="timePhrases"
        title="Time Phrases"
        collapsed={isSearching ? getCollapsed('timePhrases', hasTimeMatches) : collapsed}
        onToggle={onToggleSection}
        hidden={isSearching && !hasTimeMatches}
      >
        {filteredTime.map(({ key, label, items }) => (
          <div key={key} className="qr-group">
            <div className="qr-group-label">{label}</div>
            <VocabTable items={items} />
          </div>
        ))}
      </CollapsibleSection>

      <CollapsibleSection
        id="commonObjects"
        title="Common Objects"
        collapsed={isSearching ? getCollapsed('commonObjects', hasObjectMatches) : collapsed}
        onToggle={onToggleSection}
        hidden={isSearching && !hasObjectMatches}
      >
        <VocabTable items={filteredObjects} />
      </CollapsibleSection>

      <CollapsibleSection
        id="people"
        title="People"
        collapsed={isSearching ? getCollapsed('people', hasPeopleMatches) : collapsed}
        onToggle={onToggleSection}
        hidden={isSearching && !hasPeopleMatches}
      >
        {filteredFamily.map((entry, i) => (
          <ConjugationTable key={i} entry={entry} />
        ))}
        {filteredPeopleNouns.length > 0 && (
          <>
            <h4 className="conjugation-sub-heading">Other People</h4>
            <VocabTable items={filteredPeopleNouns} />
          </>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        id="activities"
        title="Activities"
        collapsed={isSearching ? getCollapsed('activities', hasActivityMatches) : collapsed}
        onToggle={onToggleSection}
        hidden={isSearching && !hasActivityMatches}
      >
        <VocabTable items={filteredActivities} />
      </CollapsibleSection>
    </div>
  );
}
