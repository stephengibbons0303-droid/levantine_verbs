import { useState } from 'react';
import { PERSON_LABELS, TENSE_LABELS } from '../utils/constants';

export default function VerbCard({ verb }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="verb-card" onClick={() => setExpanded(!expanded)}>
      <div className="verb-header">
        <span className="verb-id">{verb.id}.</span>
        <span className="verb-translit">{verb.verb.translit}</span>
        <span className="verb-arabic" dir="rtl">{verb.verb.arabic}</span>
        <span className="verb-english">{verb.verb.english}</span>
      </div>
      <div className="verb-meta">
        <span className="badge">{verb.classification.measure}</span>
        <span className="badge">{verb.classification.type}</span>
      </div>

      {expanded && (
        <div className="verb-details" onClick={e => e.stopPropagation()}>
          {["perfect", "bi_imperfect", "imperfect", "imperative"].map(tense => {
            const conj = verb.conjugations?.[tense];
            if (!conj?.forms?.length) return null;
            return (
              <div key={tense} className="tense-section">
                <h4>{TENSE_LABELS[tense] || tense}</h4>
                <table>
                  <tbody>
                    {conj.forms.map((f, i) => (
                      <tr key={i}>
                        <td className="person">{PERSON_LABELS[f.person] || f.person}</td>
                        <td className="translit">{f.translit}</td>
                        <td className="arabic" dir="rtl">{f.arabic}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}

          {verb.active_participle?.forms && (
            <div className="tense-section">
              <h4>Active Participle</h4>
              <table>
                <tbody>
                  {Object.entries(verb.active_participle.forms).map(([gender, f]) => (
                    <tr key={gender}>
                      <td className="person">{gender}</td>
                      <td className="translit">{f.translit}</td>
                      <td className="arabic" dir="rtl">{f.arabic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {verb.examples?.length > 0 && (
            <div className="tense-section">
              <h4>Examples</h4>
              {verb.examples.map((ex, i) => (
                <p key={i} className="example">
                  <span dir="rtl">{ex.arabic}</span> — {ex.english}
                </p>
              ))}
            </div>
          )}

          {verb.notes?.length > 0 && (
            <div className="tense-section">
              <h4>Notes</h4>
              {verb.notes.map((n, i) => <p key={i} className="note">{n}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
