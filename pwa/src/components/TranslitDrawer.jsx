import { useState, useRef, useCallback, useEffect } from 'react';
import QuickReference from './QuickReference';

const ALL_SECTIONS = [
  'consonants', 'shortVowels', 'longVowels', 'nasalVowels',
  'timePhrases', 'commonObjects', 'people', 'activities',
];

function initCollapsed() {
  return Object.fromEntries(ALL_SECTIONS.map(s => [s, true]));
}

// Transliteration guide row data for search filtering
const CONSONANT_ROWS = [
  ["2", "ء / ق", "hamza / 2āf", "glottal stop", "2akhad (أخد)"],
  ["7", "ح", "7ā2", "emphatic h", "7abb (حب)"],
  ["kh", "خ", "khā2", 'kh ("loch")', "khāf"],
  ["sh", "ش", "shīn", 'sh ("ship")', "shāf (شاف)"],
  ["3", "ع", "3ayn", "pharyngeal fricative", "bi3raf (بعرف)"],
  ["gh", "غ", "ghayn", "French r", "gharīb (غریب)"],
  ["S", "ص", "Sād", "emphatic s", "Subu7 (صُبُح)"],
  ["T", "ط", "Tā2", "emphatic t", "Tálab (طَلَب)"],
  ["D", "ض", "Dād", "emphatic d", "Dárab (ضَرَب)"],
  ["Z", "ظ", "Zā2", "emphatic z", "būZa (بوظة)"],
];

const SHORT_VOWEL_ROWS = [
  ["á", 'short stressed "a"', "Tálab"],
  ["í", 'short stressed "i"', "bíji"],
  ["ú", 'short stressed "u"', "Súbu7"],
];

const LONG_VOWEL_ROWS = [
  ["ā", 'long "a"', "shāf"],
  ["ē", 'long "e"', "jēy"],
  ["ī", 'long "i"', "jīt"],
  ["ō", 'long "o"', "béddo"],
  ["ū", 'long "u"', "Tlūb"],
];

const NASAL_VOWEL_ROWS = [
  ["ã", 'nasalized "a"'],
  ["õ", 'nasalized "o"'],
];

function rowsMatch(rows, term) {
  if (!term) return true;
  return rows.some(row => row.some(cell => cell.toLowerCase().includes(term)));
}

function filterRows(rows, term) {
  if (!term) return rows;
  return rows.filter(row => row.some(cell => cell.toLowerCase().includes(term)));
}

function CollapsibleSection({ id, title, isCollapsed, onToggle, hidden, children }) {
  if (hidden) return null;
  return (
    <div className="collapsible-section">
      <h3 className="collapsible-heading" onClick={() => onToggle(id)}>
        <span className="collapse-chevron">{isCollapsed ? '▸' : '▾'}</span>
        {title}
      </h3>
      {!isCollapsed && <div className="collapsible-content">{children}</div>}
    </div>
  );
}

export default function TranslitDrawer() {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsed, setCollapsed] = useState(initCollapsed);
  const touchStart = useRef(null);
  const touchStartY = useRef(null);
  const drawerRef = useRef(null);

  const EDGE_ZONE = 30;
  const SWIPE_THRESHOLD = 60;

  // Reset state when drawer opens
  useEffect(() => {
    if (open) {
      setCollapsed(initCollapsed());
      setSearchTerm('');
    }
  }, [open]);

  const toggleSection = useCallback((id) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStart.current = touch.clientX;
    touchStartY.current = touch.clientY;

    if (open) {
      setDragging(true);
      setDragX(0);
    } else if (touch.clientX > window.innerWidth - EDGE_ZONE) {
      setDragging(true);
      setDragX(0);
    }
  }, [open]);

  const handleTouchMove = useCallback((e) => {
    if (!dragging || touchStart.current === null) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.current;
    const deltaY = Math.abs(touch.clientY - touchStartY.current);

    if (deltaY > Math.abs(deltaX) + 10 && Math.abs(deltaX) < 20) {
      setDragging(false);
      setDragX(null);
      return;
    }

    if (open) {
      setDragX(Math.max(0, deltaX));
    } else {
      setDragX(Math.min(0, deltaX));
    }
  }, [dragging, open]);

  const handleTouchEnd = useCallback(() => {
    if (!dragging) {
      touchStart.current = null;
      return;
    }

    if (open) {
      if (dragX > SWIPE_THRESHOLD) setOpen(false);
    } else {
      if (dragX !== null && Math.abs(dragX) > SWIPE_THRESHOLD) setOpen(true);
    }

    setDragging(false);
    setDragX(null);
    touchStart.current = null;
  }, [dragging, dragX, open]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  let transform = open ? 'translateX(0)' : 'translateX(100%)';
  if (dragging && dragX !== null) {
    if (open) {
      transform = `translateX(${dragX}px)`;
    } else {
      const drawerWidth = window.innerWidth * 0.8;
      const offset = Math.max(0, drawerWidth + dragX);
      transform = `translateX(${offset}px)`;
    }
  }

  const transition = dragging ? 'none' : 'transform 0.3s ease';

  // Search logic for transliteration guide sections
  const term = searchTerm.toLowerCase();
  const isSearching = term.length > 0;

  const consonantMatches = rowsMatch(CONSONANT_ROWS, term);
  const shortVowelMatches = rowsMatch(SHORT_VOWEL_ROWS, term);
  const longVowelMatches = rowsMatch(LONG_VOWEL_ROWS, term);
  const nasalVowelMatches = rowsMatch(NASAL_VOWEL_ROWS, term);

  // Also match on the note text for consonants
  const consonantNoteMatch = !term || "all other consonants b t d f j k l m n r s w y z h use standard latin equivalents".includes(term);
  const hasConsonantMatches = consonantMatches || consonantNoteMatch;

  const filteredConsonants = filterRows(CONSONANT_ROWS, term);
  const filteredShortVowels = filterRows(SHORT_VOWEL_ROWS, term);
  const filteredLongVowels = filterRows(LONG_VOWEL_ROWS, term);
  const filteredNasalVowels = filterRows(NASAL_VOWEL_ROWS, term);

  // When searching, force sections open if they have matches
  const getSectionCollapsed = (id, hasMatches) => {
    if (isSearching) return !hasMatches;
    return collapsed[id] !== false; // default collapsed
  };

  return (
    <>
      {open && (
        <div className="drawer-overlay" onClick={() => setOpen(false)} />
      )}
      <div
        ref={drawerRef}
        className="translit-drawer"
        style={{ transform, transition }}
      >
        <div className="drawer-header">
          <h2>Reference</h2>
          <button className="drawer-close" onClick={() => setOpen(false)}>✕</button>
        </div>
        <div className="drawer-body">
          <input
            type="text"
            className="drawer-search"
            placeholder="Search (English, transliteration, or Arabic)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <CollapsibleSection
            id="consonants"
            title="Consonants"
            isCollapsed={getSectionCollapsed('consonants', hasConsonantMatches)}
            onToggle={toggleSection}
            hidden={isSearching && !hasConsonantMatches}
          >
            <table className="guide-table">
              <thead>
                <tr><th>Char</th><th>Arabic</th><th>Name</th><th>Sound</th><th>Example</th></tr>
              </thead>
              <tbody>
                {(isSearching ? filteredConsonants : CONSONANT_ROWS).map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => <td key={j}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="guide-note">All other consonants (b, t, d, f, j, k, l, m, n, r, s, w, y, z, h) use standard Latin equivalents.</p>
          </CollapsibleSection>

          <CollapsibleSection
            id="shortVowels"
            title="Short Stressed Vowels"
            isCollapsed={getSectionCollapsed('shortVowels', shortVowelMatches)}
            onToggle={toggleSection}
            hidden={isSearching && !shortVowelMatches}
          >
            <table className="guide-table">
              <thead><tr><th>Char</th><th>Sound</th><th>Example</th></tr></thead>
              <tbody>
                {(isSearching ? filteredShortVowels : SHORT_VOWEL_ROWS).map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => <td key={j}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </CollapsibleSection>

          <CollapsibleSection
            id="longVowels"
            title="Long Vowels"
            isCollapsed={getSectionCollapsed('longVowels', longVowelMatches)}
            onToggle={toggleSection}
            hidden={isSearching && !longVowelMatches}
          >
            <table className="guide-table">
              <thead><tr><th>Char</th><th>Sound</th><th>Example</th></tr></thead>
              <tbody>
                {(isSearching ? filteredLongVowels : LONG_VOWEL_ROWS).map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => <td key={j}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </CollapsibleSection>

          <CollapsibleSection
            id="nasalVowels"
            title="Nasal Vowels"
            isCollapsed={getSectionCollapsed('nasalVowels', nasalVowelMatches)}
            onToggle={toggleSection}
            hidden={isSearching && !nasalVowelMatches}
          >
            <table className="guide-table">
              <thead><tr><th>Char</th><th>Sound</th></tr></thead>
              <tbody>
                {(isSearching ? filteredNasalVowels : NASAL_VOWEL_ROWS).map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => <td key={j}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </CollapsibleSection>

          <QuickReference
            searchTerm={searchTerm}
            collapsed={collapsed}
            onToggleSection={toggleSection}
          />
        </div>
      </div>

      <div className="drawer-edge-tab" onClick={() => setOpen(true)}>
        <span>◀</span>
      </div>
    </>
  );
}
