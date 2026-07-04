import PlayButton from './PlayButton';

const tierColor = (d) => ({
  A: 'var(--tier-a)',
  B: 'var(--tier-b)',
  BA: 'var(--tier-b)',
  C: 'var(--tier-c)',
  D: 'var(--tier-d)',
  E: 'var(--tier-e)',
}[d] || 'var(--text-muted)');

export default function VerbCard({ verb, num, onOpen }) {
  return (
    <div className="sn-row" onClick={() => onOpen?.(verb)}>
      <span className="sn-row-num">{num ?? verb.id}</span>
      <div className="sn-row-main">
        <div className="sn-row-top">
          <div className="sn-row-lead">
            <span className="sn-row-ar" dir="rtl">{verb.verb.arabic}</span>
            <span className="sn-row-tr">{verb.verb.translit}</span>
          </div>
          <span className="sn-row-gloss">{verb.verb.english}</span>
        </div>
        <div className="sn-row-bottom">
          <div className="sn-badges">
            {verb.classification && (
              <>
                <span className="sn-badge measure">{verb.classification.measure}</span>
                <span className="sn-badge type">{verb.classification.type}</span>
              </>
            )}
            {verb.difficulty && (
              <span className="sn-badge tier" style={{ background: tierColor(verb.difficulty) }}>
                {verb.difficulty}
              </span>
            )}
          </div>
          <PlayButton text={verb.verb.arabic} label="Hear this verb" />
        </div>
      </div>
    </div>
  );
}
