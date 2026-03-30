import { useMemo } from 'react';
import { loadAllCards, getTierMasteryStats, getUnlockedTiers } from '../utils/srsState';
import { getNextInterval, isMastered } from '../utils/fsrs';
import { getDueCount } from '../utils/scheduler';

const TIER_ORDER = ['A', 'B', 'C', 'D', 'E'];
const TIER_COLORS = { A: '#0c6', B: '#0af', C: '#f90', D: '#f44', E: '#a0a' };

export default function SRSDashboard({ verbs }) {
  const stats = useMemo(() => {
    const cards = loadAllCards();
    const unlockedTiers = getUnlockedTiers(verbs);
    const dueCount = getDueCount(verbs);
    const now = new Date();

    const tiers = TIER_ORDER.map(tier => ({
      tier,
      unlocked: unlockedTiers.includes(tier),
      ...getTierMasteryStats(verbs, tier),
    }));

    // Trouble verbs (2+ confident errors)
    const troubleVerbs = [];
    let totalReviewed = 0;
    for (const verb of verbs) {
      const card = cards[verb.id];
      if (!card || card.reps === 0) continue;
      totalReviewed++;
      if (card.confident_errors >= 2) {
        troubleVerbs.push({ verb, card });
      }
    }

    return { tiers, dueCount, totalReviewed, troubleVerbs };
  }, [verbs]);

  return (
    <div className="page srs-dashboard">
      <h2>SRS Progress</h2>

      <div className="srs-overview">
        <div className="srs-overview-card">
          <div className="srs-overview-num">{stats.dueCount}</div>
          <div className="srs-overview-label">Due today</div>
        </div>
        <div className="srs-overview-card">
          <div className="srs-overview-num">{stats.totalReviewed}</div>
          <div className="srs-overview-label">Reviewed</div>
        </div>
      </div>

      <h3>Tier Mastery</h3>
      <div className="tier-cards">
        {stats.tiers.map(t => (
          <div key={t.tier} className={`tier-card ${t.unlocked ? '' : 'locked'}`}>
            <div className="tier-header">
              <span className="tier-badge" style={{ background: TIER_COLORS[t.tier] }}>
                {t.tier}
              </span>
              {!t.unlocked && <span className="tier-lock">Locked</span>}
            </div>
            <div className="tier-progress-bar">
              <div
                className="tier-progress-fill"
                style={{ width: `${Math.round(t.percent * 100)}%`, background: TIER_COLORS[t.tier] }}
              />
            </div>
            <div className="tier-progress-text">
              {t.mastered} / {t.total} mastered ({Math.round(t.percent * 100)}%)
            </div>
          </div>
        ))}
      </div>

      {stats.troubleVerbs.length > 0 && (
        <>
          <h3>Trouble Verbs</h3>
          <div className="trouble-list">
            {stats.troubleVerbs.map(({ verb, card }) => (
              <div key={verb.id} className="trouble-item">
                <span className="trouble-verb">{verb.verb.translit}</span>
                <span className="trouble-english">{verb.verb.english}</span>
                <span className="trouble-errors">{card.confident_errors} confident errors</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
