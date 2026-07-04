import { useMemo } from 'react';
import { loadAllCards, getTierMasteryStats, getUnlockedTiers } from '../utils/srsState';
import { getDueCount } from '../utils/scheduler';
import { FSRS_CONFIG } from '../utils/fsrs';

const TIER_ORDER = ['A', 'B', 'C', 'D', 'E'];
const TIER_HEX = {
  A: 'var(--tier-a)', B: 'var(--tier-b)', C: 'var(--tier-c)', D: 'var(--tier-d)', E: 'var(--tier-e)',
};
const TIER_MEANING = {
  A: 'Everyday core', B: 'Common', C: 'Intermediate', D: 'Advanced', E: 'Hardest',
};

export default function SRSDashboard({ verbs }) {
  const stats = useMemo(() => {
    const cards = loadAllCards();
    const unlockedTiers = getUnlockedTiers(verbs);
    const dueCount = getDueCount(verbs);

    const tiers = TIER_ORDER.map(tier => ({
      tier,
      unlocked: unlockedTiers.includes(tier),
      ...getTierMasteryStats(verbs, tier),
    }));

    const troubleVerbs = [];
    let totalReviewed = 0;
    for (const verb of verbs) {
      const card = cards[verb.id];
      if (!card || card.reps === 0) continue;
      totalReviewed++;
      if (card.confident_errors >= 2) troubleVerbs.push({ verb, card });
    }

    return { tiers, dueCount, totalReviewed, troubleVerbs };
  }, [verbs]);

  const unlockPct = Math.round(FSRS_CONFIG.tierUnlockPercent * 100);
  const firstLockedIdx = stats.tiers.findIndex(t => !t.unlocked);

  return (
    <div className="sn-srs">
      <div className="sn-srs-eyebrow">Spaced repetition</div>
      <div className="sn-srs-head">
        <h1 className="sn-srs-title" dir="rtl">إتقان</h1>
        <span className="sn-srs-sub">Mastery</span>
      </div>

      <div className="sn-srs-stats">
        <div className="sn-srs-card">
          <div className="sn-srs-num gold">{stats.dueCount}</div>
          <div className="sn-srs-card-label">Due today</div>
        </div>
        <div className="sn-srs-card">
          <div className="sn-srs-num green">{stats.totalReviewed}</div>
          <div className="sn-srs-card-label">Reviewed</div>
        </div>
      </div>

      <div className="sn-srs-section-label">Tier mastery</div>
      <div className="sn-srs-tiers">
        {stats.tiers.map((t, i) => {
          const pct = Math.round((t.percent || 0) * 100);
          return (
            <div key={t.tier} className={`sn-srs-tier ${t.unlocked ? '' : 'locked'}`}>
              <div className="sn-srs-tier-top">
                <div className="sn-srs-tier-lead">
                  <span className="sn-srs-tier-badge" style={{ background: TIER_HEX[t.tier] }}>{t.tier}</span>
                  {t.unlocked
                    ? <span className="sn-srs-tier-name">{TIER_MEANING[t.tier]}</span>
                    : <span className="sn-srs-tier-locked">Locked</span>}
                </div>
                <span className="sn-srs-tier-count">
                  {t.mastered}<span className="dim"> / {t.total}</span>
                </span>
              </div>
              <div className="sn-srs-bar">
                {t.unlocked && (
                  <div className="sn-srs-bar-fill" style={{ width: `${pct}%`, background: TIER_HEX[t.tier] }} />
                )}
              </div>
              {t.unlocked ? (
                <div className="sn-srs-tier-note">{pct}% mastered</div>
              ) : (
                i === firstLockedIdx && (
                  <div className="sn-srs-tier-note">Unlocks at {unlockPct}% of Tier {TIER_ORDER[i - 1]}</div>
                )
              )}
            </div>
          );
        })}
      </div>

      {stats.troubleVerbs.length > 0 && (
        <>
          <div className="sn-srs-section-label">Trouble verbs</div>
          <div className="sn-srs-trouble">
            {stats.troubleVerbs.map(({ verb, card }) => (
              <div key={verb.id} className="sn-srs-trouble-item">
                <span className="tr-translit">{verb.verb.translit}</span>
                <span className="tr-en">{verb.verb.english}</span>
                <span className="tr-err">{card.confident_errors} slips</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
