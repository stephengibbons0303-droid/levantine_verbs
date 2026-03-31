import { TIME_ADVERBS, OBJECTS, PEOPLE, ACTIVITIES } from '../utils/vocabPool';

const TIME_SECTIONS = [
  { key: 'past', label: 'Past' },
  { key: 'present', label: 'Present' },
  { key: 'future', label: 'Future' },
  { key: 'imperative', label: 'Command' },
];

function VocabTable({ items }) {
  return (
    <table className="qr-table">
      <tbody>
        {items.map((item, i) => (
          <tr key={i}>
            <td className="qr-translit">{item.translit}</td>
            <td className="qr-english">{item.english}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function QuickReference() {
  return (
    <div className="quick-reference">
      <h3 className="qr-heading">Time Phrases</h3>
      {TIME_SECTIONS.map(({ key, label }) => (
        <div key={key} className="qr-group">
          <div className="qr-group-label">{label}</div>
          <VocabTable items={TIME_ADVERBS[key]} />
        </div>
      ))}

      <h3 className="qr-heading">Common Objects</h3>
      <VocabTable items={OBJECTS} />

      <h3 className="qr-heading">People</h3>
      <VocabTable items={PEOPLE} />

      <h3 className="qr-heading">Activities</h3>
      <VocabTable items={ACTIVITIES} />
    </div>
  );
}
