import { useState, useEffect, useCallback } from 'react';
import { generateRemedialItems } from '../utils/scheduler';
import { PERSON_LABELS, TENSE_LABELS } from '../utils/constants';
import { getTenseLabel } from '../utils/tenseLabels';

/**
 * RemedialSequence — Confident error remedial path UI.
 *
 * Triggered by Easy(4) + incorrect answer.
 * 1. Correction display: wrong vs correct + full conjugation table (3s minimum)
 * 2. Immediate retrieval practice: 2-3 follow-up questions on SAME verb
 * 3. Return to normal flow via onComplete callback
 */
export default function RemedialSequence({ verb, originalTense, originalPerson, wrongAnswer, correctAnswer, useArabic, onComplete }) {
  const [phase, setPhase] = useState('correction'); // 'correction' | 'followup'
  const [canProceed, setCanProceed] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const [followUpIdx, setFollowUpIdx] = useState(0);
  const [followUpFeedback, setFollowUpFeedback] = useState(null);
  const [followUpScore, setFollowUpScore] = useState(0);

  // 3-second minimum on correction display
  useEffect(() => {
    if (phase === 'correction') {
      const timer = setTimeout(() => setCanProceed(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Generate follow-up items when entering followup phase
  const startFollowUps = useCallback(() => {
    const items = generateRemedialItems(verb, originalTense, originalPerson);
    setFollowUps(items);
    setFollowUpIdx(0);
    setFollowUpFeedback(null);
    setFollowUpScore(0);
    setPhase('followup');
  }, [verb, originalTense, originalPerson]);

  // Get the conjugation table for the original tense
  const tenseData = verb.conjugations?.[originalTense];
  const allTenses = ['perfect', 'imperfect', 'bi_imperfect', 'imperative'];

  // Follow-up question handling
  const currentFollowUp = followUps[followUpIdx];
  let followUpQuestion = null;
  if (currentFollowUp && phase === 'followup') {
    const tenseFormsData = verb.conjugations?.[currentFollowUp.tense];
    const forms = tenseFormsData?.forms || [];
    const correctForm = forms.find(f => f.person === currentFollowUp.person);
    if (correctForm) {
      const key = useArabic ? 'arabic' : 'translit';
      const answer = correctForm[key];
      // Same-verb distractors
      const distractors = forms
        .map(f => f[key])
        .filter(v => v !== answer);
      const shuffled = [...distractors].sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [answer, ...shuffled].sort(() => Math.random() - 0.5);
      const personLabel = PERSON_LABELS[currentFollowUp.person] || currentFollowUp.person;
      const { label: tenseLabel } = getTenseLabel(currentFollowUp.tense);

      const prompt = currentFollowUp.tense === 'imperative'
        ? `${tenseLabel} — to ${personLabel}`
        : `${personLabel} — ${tenseLabel}`;

      followUpQuestion = {
        prompt,
        answer,
        options,
        tense: currentFollowUp.tense,
        person: currentFollowUp.person,
      };
    }
  }

  const handleFollowUpAnswer = (opt) => {
    if (!followUpQuestion) return;
    const correct = opt === followUpQuestion.answer;
    if (correct) setFollowUpScore(s => s + 1);
    setFollowUpFeedback({ correct, answer: followUpQuestion.answer });
  };

  const nextFollowUp = () => {
    setFollowUpFeedback(null);
    if (followUpIdx + 1 >= followUps.length) {
      onComplete();
    } else {
      setFollowUpIdx(i => i + 1);
    }
  };

  // Phase 1: Correction display
  if (phase === 'correction') {
    return (
      <div className="remedial-sequence">
        <div className="remedial-header">Confident Error — Review Required</div>

        <div className="remedial-comparison">
          <div className="remedial-wrong">
            <span className="remedial-label">Your answer</span>
            <span className="remedial-value">{wrongAnswer}</span>
          </div>
          <div className="remedial-correct">
            <span className="remedial-label">Correct answer</span>
            <span className="remedial-value">{correctAnswer}</span>
          </div>
        </div>

        {tenseData && (
          <div className="remedial-table">
            <h4>{TENSE_LABELS[originalTense] || originalTense}</h4>
            <table>
              <tbody>
                {tenseData.forms.map(f => (
                  <tr key={f.person} className={f.person === originalPerson ? 'highlight' : ''}>
                    <td className="person">{PERSON_LABELS[f.person] || f.person}</td>
                    <td className="translit">{f.translit}</td>
                    <td className="arabic" dir="rtl">{f.arabic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          className={`start-btn ${canProceed ? '' : 'disabled'}`}
          onClick={canProceed ? startFollowUps : undefined}
          disabled={!canProceed}
        >
          {canProceed ? 'Continue to Practice' : 'Review the table...'}
        </button>
      </div>
    );
  }

  // Phase 2: Follow-up questions
  if (phase === 'followup' && followUpQuestion) {
    return (
      <div className="remedial-sequence">
        <div className="remedial-header">
          Remedial Practice ({followUpIdx + 1}/{followUps.length})
        </div>

        <div className="verb-info-bar">
          <span className="vi-translit">{verb.verb.translit}</span>
          <span className="vi-arabic" dir="rtl">{verb.verb.arabic}</span>
          <span className="vi-english">{verb.verb.english}</span>
        </div>

        <div className="quiz-prompt">{followUpQuestion.prompt}</div>

        <div className="options">
          {followUpQuestion.options.map((opt, i) => (
            <button
              key={i}
              className={`option-btn ${
                followUpFeedback
                  ? opt === followUpQuestion.answer
                    ? 'correct'
                    : followUpFeedback.correct
                      ? ''
                      : 'wrong'
                  : ''
              }`}
              onClick={() => !followUpFeedback && handleFollowUpAnswer(opt)}
              disabled={!!followUpFeedback}
            >
              {opt}
            </button>
          ))}
        </div>

        {followUpFeedback && (
          <div className={`feedback ${followUpFeedback.correct ? 'correct' : 'wrong'}`}>
            {followUpFeedback.correct ? 'Correct!' : `Wrong. Answer: ${followUpFeedback.answer}`}
            <button className="next-btn" onClick={nextFollowUp}>
              {followUpIdx + 1 >= followUps.length ? 'Done' : 'Next'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Fallback: no follow-up questions available
  return (
    <div className="remedial-sequence">
      <div className="remedial-header">Review Complete</div>
      <button className="start-btn" onClick={onComplete}>Continue</button>
    </div>
  );
}
