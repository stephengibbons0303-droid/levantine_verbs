import { useState, useCallback, useMemo, useEffect } from 'react';
import { speak, stopSpeaking } from '../voice/speech';
import { PERSONS, PERSON_LABELS, TOPICS } from '../utils/constants';
import { getTenseLabel } from '../utils/tenseLabels';
import { buildExampleSentence } from '../utils/exampleSentenceBuilder';
import { buildQuizPrompt } from '../utils/quizPromptBuilder';
import { buildFilledSentence, buildEnglishSentence } from '../utils/englishSentenceBuilder';
import { mapConfidenceOutcome, updateCard } from '../utils/fsrs';
import { getCard, saveCard } from '../utils/srsState';
import { getNextSRSItem, getDueCount as getDueCountFromScheduler, getNewCount } from '../utils/scheduler';
import { getBlankedExamples } from '../utils/quizExamples';
import RemedialSequence from '../components/RemedialSequence';

const QUIZ_VOICE = 'Haneen'; // Leva voice for spoken quiz audio

// FSRS grade row — doubles as the submit action (picking one grades + advances).
// Colours follow the Sanober tier palette (Again red, Hard gold, Good green, Easy blue).
const GRADES = [
  { value: 1, label: 'Again', mod: 'again' },
  { value: 2, label: 'Hard', mod: 'hard' },
  { value: 3, label: 'Good', mod: 'good' },
  { value: 4, label: 'Easy', mod: 'easy' },
];

// Question-type choice for the review session ('mixed' = auto-pick per verb).
const QUESTION_TYPES = [
  { value: 'mixed', label: 'Mixed (recommended)' },
  { value: 'conjugation', label: 'Conjugation' },
  { value: 'listening', label: 'Listening' },
  { value: 'inverse_mcq', label: 'Inverse MCQ' },
  { value: 'gap_fill', label: 'Gap-fill' },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadPersons() {
  try {
    const saved = localStorage.getItem('quiz_persons');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...PERSONS];
}

export default function Quiz({ verbs }) {
  const [useArabic, setUseArabic] = useState(false);
  const [selectedPersons, setSelectedPersons] = useState(loadPersons);
  const [showPersons, setShowPersons] = useState(false);
  const [showInverseEn, setShowInverseEn] = useState(() =>
    localStorage.getItem('srs_inverse_en') === 'true'
  );
  const toggleInverseEn = () => setShowInverseEn(v => {
    const next = !v;
    localStorage.setItem('srs_inverse_en', String(next));
    return next;
  });

  // SRS verb range & interleaving settings (persisted)
  const [verbRange, setVerbRange] = useState(() =>
    localStorage.getItem('srs_verb_range') || 'full_tier'
  );
  const [selectedTopic, setSelectedTopic] = useState(() =>
    localStorage.getItem('srs_topic') || 'daily_routine'
  );
  const [maxQuestionsPerVerb, setMaxQuestionsPerVerb] = useState(() =>
    parseInt(localStorage.getItem('srs_max_per_verb') || '3')
  );
  const [questionType, setQuestionType] = useState(() =>
    localStorage.getItem('srs_question_type') || 'mixed'
  );

  // Interleaving tracking (session-only)
  const [verbSessionCounts, setVerbSessionCounts] = useState({});
  const [currentVerbId, setCurrentVerbId] = useState(null);
  const [recentTensesForVerb, setRecentTensesForVerb] = useState([]);

  // SRS session state
  const [srsActive, setSrsActive] = useState(false);
  const [srsItem, setSrsItem] = useState(null);
  const [srsQuestion, setSrsQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [srsSubmitted, setSrsSubmitted] = useState(false);
  const [srsFeedback, setSrsFeedback] = useState(null);
  const [srsScore, setSrsScore] = useState(0);
  const [srsTotal, setSrsTotal] = useState(0);
  const [lastItem, setLastItem] = useState(null);
  const [remedialState, setRemedialState] = useState(null);
  const [srsExampleSentence, setSrsExampleSentence] = useState(null);

  const togglePerson = (person) => {
    setSelectedPersons(prev => {
      const next = prev.includes(person)
        ? prev.filter(p => p !== person)
        : [...prev, person];
      if (next.length === 0) return prev;
      localStorage.setItem('quiz_persons', JSON.stringify(next));
      return next;
    });
  };

  // Verb filtering based on SRS verb range selection
  const filteredVerbs = useMemo(() => {
    if (verbRange === 'essential') return verbs.filter(v => v.essential);
    if (verbRange === 'topic') return verbs.filter(v => v.topic === selectedTopic);
    return verbs; // 'full_tier' — scheduler handles tier gating internally
  }, [verbs, verbRange, selectedTopic]);

  const updateVerbRange = (val) => {
    setVerbRange(val);
    localStorage.setItem('srs_verb_range', val);
  };
  const updateSelectedTopic = (val) => {
    setSelectedTopic(val);
    localStorage.setItem('srs_topic', val);
  };
  const updateMaxQuestionsPerVerb = (val) => {
    setMaxQuestionsPerVerb(val);
    localStorage.setItem('srs_max_per_verb', String(val));
  };
  const updateQuestionType = (val) => {
    setQuestionType(val);
    localStorage.setItem('srs_question_type', val);
  };

  // --- Blanked-example pool (drives inverse_mcq + gap_fill; only ~103 verbs qualify) ---
  const blanked = useMemo(() => getBlankedExamples(verbs), [verbs]);
  const blankedByVerb = useMemo(() => {
    const m = new Map();
    for (const e of blanked) {
      if (!m.has(e.verbId)) m.set(e.verbId, []);
      m.get(e.verbId).push(e);
    }
    return m;
  }, [blanked]);

  // --- Per-verb question builders (one question for a specific scheduled verb) ---

  // Conjugation MCQ — the core drill; also the guaranteed fallback for any verb.
  const buildConjugationQ = useCallback((item) => {
    if (!item) return null;
    const { verb, tense: t, person } = item;
    const tenseData = verb.conjugations?.[t];
    if (!tenseData) return null;
    const forms = tenseData.forms || [];
    const correctForm = forms.find(f => f.person === person);
    if (!correctForm) return null;

    const key = useArabic ? 'arabic' : 'translit';
    const answer = correctForm[key];
    const distractors = forms
      .map(f => f[key])
      .filter(v => v !== answer);
    const shuffled = shuffle(distractors).slice(0, 3);
    const options = shuffle([answer, ...shuffled]);
    const { particle } = getTenseLabel(t);
    const { prompt, parts } = buildQuizPrompt(verb, t, person, particle);

    return {
      type: 'conjugation',
      prompt,
      parts,
      verb_info: { translit: verb.verb.translit, arabic: verb.verb.arabic, english: verb.verb.english },
      answer,
      answer_alt: useArabic ? correctForm.translit : correctForm.arabic,
      options,
      tense: t,
      person,
      particle,
      verbId: verb.id,
    };
  }, [useArabic]);

  // Listening (all verbs): hear the Lebanese, pick the English meaning.
  const buildListeningQ = useCallback((verb) => {
    const pool = verbs.filter(v => v.verb?.arabic && v.verb?.english);
    const ex = verb.examples || [];
    const useEx = ex.length ? pick(ex) : null; // full sentence if available, else the verb word
    const wrong = shuffle(
      [...new Set(pool.filter(v => v.verb.english !== verb.verb.english).map(v => v.verb.english))]
    ).slice(0, 3);
    if (wrong.length < 3) return null;
    return {
      type: 'listening',
      audioArabic: useEx ? useEx.arabic : verb.verb.arabic,
      audioTranslit: useEx ? useEx.translit : verb.verb.translit,
      sentenceEnglish: useEx ? useEx.english : null,
      options: shuffle([verb.verb.english, ...wrong]),
      answer: verb.verb.english,
      reveal: { translit: verb.verb.translit, arabic: verb.verb.arabic, english: verb.verb.english },
      verbId: verb.id,
    };
  }, [verbs]);

  // Inverse MCQ (example verbs): given the verb, pick the sentence it completes.
  const buildInverseQ = useCallback((verb) => {
    const mine = blankedByVerb.get(verb.id);
    if (!mine?.length) return null;
    const target = pick(mine);
    const others = shuffle(blanked.filter(e => e.verbId !== verb.id));
    const chosen = [];
    const used = new Set([verb.id]);
    for (const o of others) {
      if (used.has(o.verbId)) continue; // one sentence per verb, no accidental twins
      used.add(o.verbId);
      chosen.push(o);
      if (chosen.length === 3) break;
    }
    if (chosen.length < 3) return null;
    const options = shuffle([target, ...chosen]).map(e => ({
      value: e.blankTranslit,
      translit: e.blankTranslit,
      arabic: e.blankArabic,
      english: e.english || '',
    }));
    return {
      type: 'inverse_mcq',
      verb_info: target.verbInfo,
      // The conjugated form the sentence actually uses — shown at the top of the card.
      head_form: { translit: target.answerTranslit, arabic: target.answerArabic },
      prompt_hint: 'Which sentence uses this verb?',
      options,
      answer: target.blankTranslit,
      answer_english: target.english,
      answer_fill: useArabic ? target.answerArabic : target.answerTranslit,
      verbId: verb.id,
    };
  }, [blanked, blankedByVerb, useArabic]);

  // Gap-fill (example verbs): read the sentence, pick the verb form for the blank.
  const buildGapQ = useCallback((verb) => {
    const mine = blankedByVerb.get(verb.id);
    if (!mine?.length) return null;
    const target = pick(mine);
    const answer = useArabic ? target.answerArabic : target.answerTranslit;
    if (!answer) return null;
    const distract = [];
    const seen = new Set([answer]);
    for (const o of shuffle(blanked.filter(e => e.verbId !== verb.id))) {
      const f = useArabic ? o.answerArabic : o.answerTranslit;
      if (!f || seen.has(f)) continue;
      seen.add(f);
      distract.push(f);
      if (distract.length === 3) break;
    }
    if (distract.length < 3) return null;
    return {
      type: 'gap_fill',
      prompt: useArabic ? target.blankArabic : target.blankTranslit,
      prompt_alt: useArabic ? target.blankTranslit : target.blankArabic,
      options: shuffle([answer, ...distract]),
      answer,
      answer_english: target.english,
      reveal: target.verbInfo,
      verbId: verb.id,
    };
  }, [blanked, blankedByVerb, useArabic]);

  // Pick a question type for this scheduled verb (weighted), falling back to
  // conjugation MCQ when the chosen type can't be built for the verb.
  const buildOfType = useCallback((t, item) => {
    if (t === 'conjugation') return buildConjugationQ(item);
    if (t === 'listening') return buildListeningQ(item.verb);
    if (t === 'inverse_mcq') return buildInverseQ(item.verb);
    if (t === 'gap_fill') return buildGapQ(item.verb);
    return null;
  }, [buildConjugationQ, buildListeningQ, buildInverseQ, buildGapQ]);

  const buildSRSQuestionForItem = useCallback((item) => {
    if (!item) return null;
    // Forced type: honour the user's choice, falling back to conjugation MCQ when
    // the type can't be built for this verb (inverse/gap only cover example verbs).
    if (questionType !== 'mixed') {
      return buildOfType(questionType, item) || buildConjugationQ(item);
    }
    // Mixed: conjugation weighted x2 (it drills the actual scheduled tense/person the
    // FSRS card tracks); listening covers all verbs; inverse/gap need a blanked example.
    const pool = ['conjugation', 'conjugation', 'listening'];
    if (blankedByVerb.has(item.verb.id)) pool.push('inverse_mcq', 'gap_fill');
    for (const t of shuffle(pool)) {
      const q = buildOfType(t, item);
      if (q) return q;
    }
    return buildConjugationQ(item); // guaranteed fallback
  }, [questionType, buildOfType, buildConjugationQ, blankedByVerb]);

  const startSRS = useCallback(() => {
    const item = getNextSRSItem(filteredVerbs, null, { selectedPersons });
    if (!item) {
      setSrsActive(true);
      setSrsItem(null);
      setSrsQuestion(null);
      return;
    }
    const q = buildSRSQuestionForItem(item);
    setSrsActive(true);
    setSrsItem(item);
    setSrsQuestion(q);
    setSelectedAnswer(null);
    setSrsSubmitted(false);
    setSrsFeedback(null);
    setSrsScore(0);
    setSrsTotal(0);
    setLastItem(null);
    setRemedialState(null);
    setSrsExampleSentence(null);
    // Initialize interleaving tracking
    setVerbSessionCounts({ [item.verb.id]: 1 });
    setCurrentVerbId(item.verb.id);
    setRecentTensesForVerb([item.tense]);
  }, [filteredVerbs, selectedPersons, buildSRSQuestionForItem]);

  // Grade row is the submit: `grade` (1-4) sets the FSRS rating AND advances.
  const submitSRSAnswer = (grade) => {
    if (!selectedAnswer || !srsQuestion || !srsItem || srsSubmitted) return;

    const isCorrect = selectedAnswer === srsQuestion.answer;
    const { isConfidentError } = mapConfidenceOutcome(grade, isCorrect);

    // Update FSRS state (per-verb card, independent of question type)
    const card = getCard(srsItem.verb.id);
    const daysSince = card.last_review
      ? (new Date() - new Date(card.last_review)) / (1000 * 60 * 60 * 24)
      : 0;
    const updatedCard = updateCard(card, daysSince, grade, isCorrect);
    saveCard(srsItem.verb.id, updatedCard);

    setSrsSubmitted(true);
    setSrsFeedback({ correct: isCorrect, answer: srsQuestion.answer, alt: srsQuestion.answer_alt });
    setSrsTotal(t => t + 1);
    if (isCorrect) setSrsScore(s => s + 1);

    // Conjugation questions get a filled example sentence + English translation.
    if (srsQuestion.type === 'conjugation') {
      const correctForm = srsItem.verb.conjugations?.[srsQuestion.tense]?.forms
        ?.find(f => f.person === srsQuestion.person);
      if (correctForm && srsQuestion.parts) {
        const filled = buildFilledSentence(srsQuestion.parts, correctForm.translit);
        const english = buildEnglishSentence(srsQuestion.parts, srsItem.verb);
        setSrsExampleSentence({ sentence: filled, english });
      } else if (correctForm) {
        setSrsExampleSentence(buildExampleSentence({
          tense: srsQuestion.tense,
          person: srsQuestion.person,
          correctTranslit: correctForm.translit,
          verbEnglish: srsItem.verb.verb.english,
          particle: srsQuestion.particle,
        }));
      }
      // Confident error → remedial drill (conjugation-only; needs tense/person)
      if (isConfidentError) {
        setRemedialState({
          verb: srsItem.verb,
          tense: srsQuestion.tense,
          person: srsQuestion.person,
          wrongAnswer: selectedAnswer,
          correctAnswer: srsQuestion.answer,
        });
      }
    }
  };

  const nextSRSQuestion = () => {
    const newLastItem = srsItem ? { verbId: srsItem.verb.id, tense: srsQuestion?.tense } : null;

    // Interleaving: exclude verbs that have hit the per-verb session cap
    const exhaustedVerbIds = new Set(
      Object.entries(verbSessionCounts)
        .filter(([, count]) => count >= maxQuestionsPerVerb)
        .map(([id]) => id)
    );

    // If current verb hasn't hit cap, vary tense within it
    const currentCount = verbSessionCounts[currentVerbId] || 0;
    const excludeTenses = currentCount < maxQuestionsPerVerb ? [...recentTensesForVerb] : null;

    const item = getNextSRSItem(filteredVerbs, newLastItem, {
      selectedPersons,
      excludeVerbIds: exhaustedVerbIds,
      excludeTenses,
    });
    if (!item) {
      setSrsItem(null);
      setSrsQuestion(null);
      return;
    }

    // Update interleaving tracking
    setVerbSessionCounts(prev => ({
      ...prev,
      [item.verb.id]: (prev[item.verb.id] || 0) + 1,
    }));
    if (item.verb.id === currentVerbId) {
      setRecentTensesForVerb(prev => [...prev, item.tense]);
    } else {
      setCurrentVerbId(item.verb.id);
      setRecentTensesForVerb([item.tense]);
    }

    const q = buildSRSQuestionForItem(item);
    setSrsItem(item);
    setSrsQuestion(q);
    setSelectedAnswer(null);
    setSrsSubmitted(false);
    setSrsFeedback(null);
    setSrsExampleSentence(null);
    setLastItem(newLastItem);
    setRemedialState(null);
  };

  const skipToNewVerb = () => {
    const newLastItem = srsItem ? { verbId: srsItem.verb.id, tense: srsQuestion?.tense } : null;
    // Exclude current verb + all exhausted verbs
    const exhaustedVerbIds = new Set(
      Object.entries(verbSessionCounts)
        .filter(([, count]) => count >= maxQuestionsPerVerb)
        .map(([id]) => id)
    );
    const excludeIds = new Set([...exhaustedVerbIds]);
    if (currentVerbId != null) excludeIds.add(String(currentVerbId));
    const item = getNextSRSItem(filteredVerbs, newLastItem, {
      selectedPersons,
      excludeVerbIds: excludeIds,
    });
    if (!item) return;

    const q = buildSRSQuestionForItem(item);
    setSrsItem(item);
    setSrsQuestion(q);
    setVerbSessionCounts(prev => ({
      ...prev,
      [item.verb.id]: (prev[item.verb.id] || 0) + 1,
    }));
    setCurrentVerbId(item.verb.id);
    setRecentTensesForVerb([item.tense]);
    setSelectedAnswer(null);
    setSrsSubmitted(false);
    setSrsFeedback(null);
    setSrsExampleSentence(null);
    setLastItem(newLastItem);
    setRemedialState(null);
  };

  const handleRemedialComplete = () => {
    setRemedialState(null);
    nextSRSQuestion();
  };

  // Auto-play the audio when a listening question appears.
  useEffect(() => {
    if (srsActive && srsQuestion?.type === 'listening') {
      speak(srsQuestion.audioArabic, { speaker: QUIZ_VOICE });
    }
    return () => stopSpeaking();
  }, [srsQuestion, srsActive]);

  // Due / new counts for the setup screen
  const dueCount = getDueCountFromScheduler(filteredVerbs);
  const newCount = getNewCount(filteredVerbs);

  // ---------------------------------------------------------------- Setup screen
  if (!srsActive) {
    return (
      <div className="sn-qz">
        <div className="sn-qz-eyebrow">Set up your review</div>
        <div className="sn-qz-head">
          <h1 className="sn-qz-title" dir="rtl">اختبار</h1>
          <span className="sn-qz-sub">Quiz</span>
          <span className="sn-qz-target" aria-hidden="true" />
        </div>

        <fieldset className="sn-qz-fieldset">
          <div className="sn-qz-fieldset-legend">Verb range</div>
          <label className="sn-qz-radio">
            <input type="radio" name="verbRange" value="essential"
              checked={verbRange === 'essential'} onChange={() => updateVerbRange('essential')} />
            Top 20 essentials
          </label>
          <label className="sn-qz-radio">
            <input type="radio" name="verbRange" value="topic"
              checked={verbRange === 'topic'} onChange={() => updateVerbRange('topic')} />
            Topic
          </label>
          {verbRange === 'topic' && (
            <select value={selectedTopic} onChange={e => updateSelectedTopic(e.target.value)}
              className="sn-qz-select" style={{ marginTop: '8px' }}>
              {TOPICS.map(t => {
                const count = verbs.filter(v => v.topic === t.key).length;
                return <option key={t.key} value={t.key}>{t.label} ({count})</option>;
              })}
            </select>
          )}
          <label className="sn-qz-radio">
            <input type="radio" name="verbRange" value="full_tier"
              checked={verbRange === 'full_tier'} onChange={() => updateVerbRange('full_tier')} />
            Full tier
          </label>
        </fieldset>

        <fieldset className="sn-qz-fieldset">
          <div className="sn-qz-fieldset-legend">Session</div>
          <div className="sn-qz-slider-head">
            <span className="sn-qz-label" style={{ margin: 0 }}>Questions per verb</span>
            <span className="sn-qz-slider-val">{maxQuestionsPerVerb}</span>
          </div>
          <input
            type="range"
            className="sn-range"
            min={1}
            max={10}
            value={maxQuestionsPerVerb}
            style={{ '--pct': `${((maxQuestionsPerVerb - 1) / 9) * 100}%` }}
            onChange={e => updateMaxQuestionsPerVerb(+e.target.value)}
          />
        </fieldset>

        <div className="sn-qz-group">
          <div className="sn-qz-label">Question type</div>
          <select className="sn-qz-select" value={questionType}
            onChange={e => updateQuestionType(e.target.value)}>
            {QUESTION_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {(questionType === 'inverse_mcq' || questionType === 'gap_fill') && (
            <div className="sn-qz-note">Only example verbs support this type — others fall back to conjugation.</div>
          )}
        </div>

        <div className="sn-qz-group">
          <div className="sn-qz-label">Subjects</div>
          <button className="sn-qz-dropdown" onClick={() => setShowPersons(s => !s)}>
            <span className="sn-qz-dropdown-text">
              {selectedPersons.length === PERSONS.length
                ? 'All subjects'
                : `${selectedPersons.length} of ${PERSONS.length} selected`}
            </span>
            <span className="sn-qz-dropdown-caret">▾</span>
          </button>
          {showPersons && (
            <div className="sn-qz-chips" style={{ marginTop: '10px' }}>
              {PERSONS.map(p => (
                <button
                  key={p}
                  className={`sn-qz-chip ${selectedPersons.includes(p) ? 'active' : ''}`}
                  onClick={() => togglePerson(p)}
                >
                  {PERSON_LABELS[p]}
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="sn-qz-toggle-row" style={{ borderBottom: 'none' }}>
          <div className="sn-qz-toggle-text">Arabic-script prompts</div>
          <span className="sn-switch">
            <input type="checkbox" checked={useArabic} onChange={e => setUseArabic(e.target.checked)} />
            <span className="sn-switch-track"><span className="sn-switch-knob" /></span>
          </span>
        </label>

        <div className="sn-qz-stats">
          <span className="st">{dueCount} due</span>
          <span className="st">{newCount} new</span>
        </div>

        <button className="sn-qz-start" onClick={startSRS}>Start Review</button>
      </div>
    );
  }

  // ------------------------------------------------------------ Remedial sequence
  if (remedialState) {
    return (
      <div className="sn-qa">
        <RemedialSequence
          verb={remedialState.verb}
          originalTense={remedialState.tense}
          originalPerson={remedialState.person}
          wrongAnswer={remedialState.wrongAnswer}
          correctAnswer={remedialState.correctAnswer}
          useArabic={useArabic}
          onComplete={handleRemedialComplete}
        />
      </div>
    );
  }

  // ----------------------------------------------------------------- No more items
  if (!srsQuestion) {
    return (
      <div className="sn-qa">
        <div className="sn-qa-done">
          <h2 className="sn-qa-done-title">No verbs due for review</h2>
          {srsTotal > 0 && (
            <>
              <div className="sn-qa-score">
                <span className="sn-qa-score-num">{srsScore}</span>
                <span className="sn-qa-score-denom">/ {srsTotal}</span>
              </div>
              <div className="sn-qa-score-pct">{Math.round((srsScore / srsTotal) * 100)}%</div>
            </>
          )}
          <button className="sn-qz-start" onClick={() => setSrsActive(false)}>Back to Settings</button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------- Active question
  const q = srsQuestion;
  const isListening = q.type === 'listening';
  const isInverse = q.type === 'inverse_mcq';
  const isGap = q.type === 'gap_fill';
  const showVerb = q.verb_info && !isListening; // listening hides the verb until reveal

  return (
    <div className="sn-qa">
      <div className="sn-qa-bar">
        <span className="sn-qa-stat">{srsScore}/{srsTotal}</span>
        <span className="sn-qa-stat">{getDueCountFromScheduler(filteredVerbs)} due</span>
        <button className="sn-qa-newverb" onClick={skipToNewVerb} title="Skip to a new verb">
          &#x27F3; New verb
        </button>
      </div>

      {showVerb && (
        <div className="sn-qa-verb">
          {isInverse ? (
            <>
              <span className="sn-qa-verb-ar" dir="rtl">{q.head_form.arabic}</span>
              <span className="sn-qa-verb-tr">
                {q.head_form.translit}
                <span className="sn-qa-verb-head"> ({q.verb_info.translit})</span>
              </span>
              <span className="sn-qa-verb-en">{q.verb_info.english}</span>
            </>
          ) : (
            <>
              <span className="sn-qa-verb-ar" dir="rtl">{q.verb_info.arabic}</span>
              <span className="sn-qa-verb-tr">{q.verb_info.translit}</span>
              <span className="sn-qa-verb-en">{q.verb_info.english}</span>
            </>
          )}
        </div>
      )}

      {/* --- Prompt (per type) --- */}
      {isListening && (
        <div className="sn-qa-listen">
          <button className="sn-qa-play" onClick={() => speak(q.audioArabic, { speaker: QUIZ_VOICE })}>
            <span className="sn-qa-play-ico">►</span> Play
          </button>
          <div className="sn-qa-listen-hint">Listen, then choose the meaning</div>
        </div>
      )}

      {isInverse && (
        <div className="sn-qa-hint-row">
          <div className="sn-qa-hint">{q.prompt_hint}</div>
          <button className="sn-qa-en-toggle" onClick={toggleInverseEn}>
            {showInverseEn ? 'Hide English' : 'Show English'}
          </button>
        </div>
      )}

      {isGap && (
        <div className="sn-qa-prompt sn-qa-prompt--gap" dir={useArabic ? 'rtl' : 'ltr'}>
          {renderGapPrompt(q.prompt)}
        </div>
      )}
      {isGap && (
        <div className="sn-qa-prompt-alt" dir={useArabic ? 'ltr' : 'rtl'}>{q.prompt_alt}</div>
      )}

      {!isListening && !isInverse && !isGap && (
        <div className="sn-qa-prompt" dir={useArabic ? 'rtl' : 'ltr'}>{q.prompt}</div>
      )}

      {/* --- Options --- */}
      {isInverse ? (
        <div className="sn-qa-opts sn-qa-opts--sentence">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`sn-qa-opt sn-qa-opt--sentence ${optState(opt.value, q, selectedAnswer, srsSubmitted, srsFeedback)}`}
              onClick={() => !srsSubmitted && setSelectedAnswer(opt.value)}
              disabled={srsSubmitted}
            >
              <span className="sn-qa-opt-main">
                <span className="sn-qa-opt-tr">{opt.translit}</span>
                <span className="sn-qa-opt-ar" dir="rtl">{opt.arabic}</span>
              </span>
              {showInverseEn && opt.english && (
                <span className="sn-qa-opt-en">{opt.english}</span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="sn-qa-opts">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`sn-qa-opt ${optState(opt, q, selectedAnswer, srsSubmitted, srsFeedback)}`}
              onClick={() => !srsSubmitted && setSelectedAnswer(opt)}
              disabled={srsSubmitted}
              dir={isGap && useArabic ? 'rtl' : undefined}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* --- Grade row = submit (needs an answer selected first) --- */}
      {!srsSubmitted && (
        <>
          <div className="sn-qa-grade-label">
            {selectedAnswer ? 'Pick your confidence to submit' : 'Choose an answer first'}
          </div>
          <div className="sn-qa-grades">
            {GRADES.map(g => (
              <button
                key={g.value}
                className={`sn-qa-grade sn-qa-grade--${g.mod}`}
                onClick={() => submitSRSAnswer(g.value)}
                disabled={!selectedAnswer}
              >
                {g.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* --- Feedback / reveal --- */}
      {srsFeedback && (
        <div className={`sn-qa-fb ${srsFeedback.correct ? 'correct' : 'wrong'}`}>
          <div className="sn-qa-fb-head">
            {srsFeedback.correct
              ? 'Correct'
              : isInverse
                ? 'See the highlighted sentence'
                : `Answer: ${srsFeedback.answer}`}
            {!isInverse && !srsFeedback.correct && srsFeedback.alt && (
              <span className="sn-qa-fb-alt"> = {srsFeedback.alt}</span>
            )}
          </div>

          {(isListening || isGap) && q.reveal && (
            <div className="sn-qa-verb sn-qa-verb--reveal">
              <span className="sn-qa-verb-ar" dir="rtl">{q.reveal.arabic}</span>
              <span className="sn-qa-verb-tr">{q.reveal.translit}</span>
              <span className="sn-qa-verb-en">{q.reveal.english}</span>
            </div>
          )}
          {isListening && q.sentenceEnglish && (
            <div className="sn-qa-reveal">
              <p dir="rtl">{q.audioArabic}</p>
              <p className="sn-qa-reveal-tr">{q.audioTranslit}</p>
              <p className="sn-qa-reveal-en">{q.sentenceEnglish}</p>
              <button className="sn-qa-replay" onClick={() => speak(q.audioArabic, { speaker: QUIZ_VOICE })}>
                <span className="sn-qa-play-ico">►</span> Replay
              </button>
            </div>
          )}
          {isInverse && (
            <div className="sn-qa-reveal">
              <p className="sn-qa-reveal-en">{q.answer_english}</p>
            </div>
          )}
          {isGap && (
            <div className="sn-qa-reveal">
              <p className="sn-qa-reveal-en">{q.answer_english}</p>
            </div>
          )}
          {q.type === 'conjugation' && srsExampleSentence && (
            <div className="sn-qa-reveal">
              <p className="sn-qa-reveal-tr">{srsExampleSentence.sentence}</p>
              <p className="sn-qa-reveal-en">{srsExampleSentence.english}</p>
            </div>
          )}

          <button className="sn-qa-next" onClick={nextSRSQuestion}>Next Question</button>
        </div>
      )}
    </div>
  );
}

// Highlight the blanked slot in a gap-fill prompt.
function renderGapPrompt(prompt) {
  const parts = String(prompt).split(/(_{2,})/);
  return parts.map((p, i) =>
    /^_{2,}$/.test(p)
      ? <span key={i} className="sn-qa-blank">{p}</span>
      : <span key={i}>{p}</span>
  );
}

// Option button state class: selection (pre-submit) → correct/wrong (post-submit).
function optState(value, q, selectedAnswer, submitted, feedback) {
  if (!submitted) return value === selectedAnswer ? 'selected' : '';
  if (value === q.answer) return 'correct';
  if (value === selectedAnswer && !feedback?.correct) return 'wrong';
  return '';
}
