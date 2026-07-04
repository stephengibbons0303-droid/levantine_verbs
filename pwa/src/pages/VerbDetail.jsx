import { useState, useMemo } from 'react';
import PlayButton from '../components/PlayButton';

const TENSE_TABS = [
  { key: 'perfect', tab: 'Past', ar: 'الماضي', en: 'Past tense' },
  { key: 'bi_imperfect', tab: 'Present', ar: 'المضارع', en: 'Present tense' },
  { key: 'imperative', tab: 'Imperative', ar: 'الأمر', en: 'Imperative' },
  { key: 'imperfect', tab: 'Dependent', ar: 'المضارع المجزوم', en: 'Dependent' },
];

// Design order: 1s · 2ms · 2fs · 3ms · 3fs · 1p · 2p · 3p
const PRON_ORDER = ['ana', 'inta', 'inti', 'huwwe', 'hiyye', 'nihna', 'intu', 'hinne'];
const PRON = {
  ana: { ar: 'أنا', tr: 'ana' },
  inta: { ar: 'إنت', tr: 'inta' },
  inti: { ar: 'إنتي', tr: 'inti' },
  huwwe: { ar: 'هوّي', tr: 'huwwe' },
  hiyye: { ar: 'هيّي', tr: 'hiyye' },
  nihna: { ar: 'نحنا', tr: 'ne7na' },
  intu: { ar: 'إنتو', tr: 'into' },
  hinne: { ar: 'هنّي', tr: 'hinne' },
};

const TIER_HEX = {
  A: 'var(--tier-a)', B: 'var(--tier-b)', BA: 'var(--tier-b)',
  C: 'var(--tier-c)', D: 'var(--tier-d)', E: 'var(--tier-e)',
};

function formatRoot(root) {
  if (!root) return null;
  const letters = Array.isArray(root)
    ? root
    : String(root).split('').filter((ch) => /[؀-ۿ]/.test(ch));
  return letters.length ? letters.join(' · ') : null;
}

export default function VerbDetail({ verb, onBack }) {
  const tabs = useMemo(
    () => TENSE_TABS.filter((t) => verb.conjugations?.[t.key]?.forms?.length),
    [verb]
  );
  const [tenseKey, setTenseKey] = useState(tabs[0]?.key ?? 'perfect');
  const active = tabs.find((t) => t.key === tenseKey) ?? tabs[0];

  const formsByPerson = useMemo(() => {
    const map = {};
    for (const f of verb.conjugations?.[active?.key]?.forms ?? []) map[f.person] = f;
    return map;
  }, [verb, active]);

  const root = formatRoot(verb.classification?.root);
  const example = verb.examples?.[0];

  return (
    <div className="sn-vd">
      <div className="sn-vd-topbar">
        <button className="sn-vd-back" onClick={onBack}>
          <span className="caret" />
          Verbs
        </button>
      </div>

      <div className="sn-vd-hero">
        <div className="sn-vd-hero-top">
          <div style={{ minWidth: 0 }}>
            <div className="sn-vd-ar" dir="rtl">{verb.verb.arabic}</div>
            <div className="sn-vd-sub">
              <span className="sn-vd-tr">{verb.verb.translit}</span>
              <span className="sn-vd-gloss">{verb.verb.english}</span>
            </div>
          </div>
          <PlayButton text={verb.verb.arabic} size="lg" variant="solid" label="Hear this verb" />
        </div>

        <div className="sn-vd-meta">
          {verb.classification?.measure && (
            <span className="m-measure">Measure {verb.classification.measure}</span>
          )}
          {verb.classification?.type && <span className="m-type">{verb.classification.type}</span>}
          {root && <span className="m-root" dir="rtl">{root}</span>}
          {verb.difficulty && (
            <span className="m-tier" style={{ background: TIER_HEX[verb.difficulty] || 'var(--text-muted)' }}>
              {verb.difficulty}
            </span>
          )}
        </div>
      </div>

      <div className="sn-vd-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`sn-vd-tab ${t.key === tenseKey ? 'active' : ''}`}
            onClick={() => setTenseKey(t.key)}
          >
            {t.tab}
          </button>
        ))}
      </div>

      {tabs.length === 0 && (
        <div className="sn-vd-empty">Full conjugation for this verb is coming soon.</div>
      )}

      {active && (
        <>
          <div className="sn-vd-section">
            <span className="sn-vd-section-ar" dir="rtl">{active.ar}</span>
            <span className="sn-vd-section-en">{active.en}</span>
          </div>

          <div className="sn-vd-list">
            {PRON_ORDER.filter((p) => formsByPerson[p]).map((p) => {
              const f = formsByPerson[p];
              return (
                <div key={p} className="sn-vd-row">
                  <div className="sn-vd-pron">
                    <div className="sn-vd-pron-ar" dir="rtl">{PRON[p].ar}</div>
                    <div className="sn-vd-pron-tr">{PRON[p].tr}</div>
                  </div>
                  <div className="sn-vd-form">
                    <span className="sn-vd-form-ar" dir="rtl">{f.arabic}</span>
                    <span className="sn-vd-form-tr">{f.translit}</span>
                  </div>
                  <PlayButton text={f.arabic} size="sm" label={`Hear ${PRON[p].tr} form`} />
                </div>
              );
            })}
          </div>
        </>
      )}

      {example && (
        <div className="sn-vd-ex">
          <span className="sn-vd-ex-label">Ex</span>
          <span className="sn-vd-ex-ar" dir="rtl">{example.arabic}</span>
          {example.english && <span className="sn-vd-ex-en">{example.english}</span>}
          <PlayButton text={example.arabic} size="sm" label="Hear the example" />
        </div>
      )}
    </div>
  );
}
