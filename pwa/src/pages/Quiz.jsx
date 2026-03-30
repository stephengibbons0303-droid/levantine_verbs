import { useState, useCallback } from 'react';
import { generateQuiz } from '../utils/quizGenerator';
import { PERSONS, PERSON_LABELS } from '../utils/constants';
import { getTenseLabel } from '../utils/tenseLabels';
import { buildExampleSentence } from '../utils/exampleSentenceBuilder';
import { mapConfidenceOutcome, updateCard } from '../utils/fsrs';
import { getCard, saveCard } from '../utils/srsState';
import { getNextSRSItem, getDueCount as getDueCountFromScheduler, getNewCount } from '../utils/scheduler';
import Lightsaber from '../components/Lightsaber';
import ConfidenceSlider from '../components/ConfidenceSlider';
import RemedialSequence from '../components/RemedialSequence';

const QUIZ_TYPES = [
  { value: 'conjugation', label: 'Conjugation' },
  { value: 'ar2en', label: 'Arabic \u2192 English' },
  { value: 'en2ar', label: 'English \u2192 Arabic' },
];

const TENSE_OPTIONS = [
  { value: 'all', label: 'All tenses' },
  { value: 'perfect', label: 'Past' },
  { value: 'bi_imperfect', label: 'Present' },
  { value: 'imperfect', label: 'Dependent' },
];

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

function loadSRSMode() {
  try {
    return localStorage.getItem('srs_mode') === 'true';
  } catch {}
  return false;
}

export default function Quiz({ verbs }) {
  const [quizType, setQuizType] = useState('conjugation');
  const [tense, setTense] = useState('all');
  const [numQuestions, setNumQuestions] = useState(10);
  const [useArabic, setUseArabic] = useState(false);
  const [selectedPersons, setSelectedPersons] = useState(loadPersons);
  const [showPersons, setShowPersons] = useState(false);
  const [srsMode, setSrsMode] = useState(loadSRSMode);

  // Free practice state
  const [questions, setQuestions] = useState(null);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [exampleSentence, setExampleSentence] = useState(null);

  // SRS mode state
  const [srsActive, setSrsActive] = useState(false);
  const [srsItem, setSrsItem] = useState(null);
  const [srsQuestion, setSrsQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [confidence, setConfidence] = useState(3);
  const [srsSubmitted, setSrsSubmitted] = useState(false);
  const [srsFeedback, setSrsFeedback] = useState(null);
  const [srsScore, setSrsScore] = useState(0);
  const [srsTotal, setSrsTotal] = useState(0);
  const [lastItem, setLastItem] = useState(null);
  const [remedialState, setRemedialState] = useState(null);
  const [srsExampleSentence, setSrsExampleSentence] = useState(null);

  const toggleSrsMode = () => {
    const next = !srsMode;
    setSrsMode(next);
    localStorage.setItem('srs_mode', String(next));
  };

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

  // --- Free Practice ---
  const startQuiz = useCallback(() => {
    const qs = generateQuiz(verbs, quizType, numQuestions, useArabic, tense, selectedPersons);
    setQuestions(qs);
    setIdx(0);
    setScore(0);
    setLevel(0);
    setFeedback(null);
  }, [verbs, quizType, numQuestions, useArabic, tense, selectedPersons]);

  const handleAnswer = (opt) => {
    const q = questions[idx];
    const correct = opt === q.answer;
    if (correct) {
      setScore(s => s + 1);
      setLevel(l => Math.min(questions.length, l + 1));
    } else {
      setLevel(l => Math.max(0, l - 1));
    }
    setFeedback({ correct, answer: q.answer, alt: q.answer_alt });

    // Build example sentence if we have enough info (conjugation questions)
    if (q.tense && q.person && q.verb_info) {
      const verb = verbs.find(v => v.verb.translit === q.verb_info.translit);
      if (verb) {
        const correctForm = verb.conjugations?.[q.tense]?.forms?.find(f => f.person === q.person);
        if (correctForm) {
          setExampleSentence(buildExampleSentence({
            tense: q.tense,
            person: q.person,
            correctTranslit: correctForm.translit,
            verbEnglish: verb.verb.english,
            particle: q.particle || null,
          }));
        }
      }
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setExampleSentence(null);
    setIdx(i => i + 1);
  };

  // --- SRS Mode ---
  const buildSRSQuestion = useCallback((item) => {
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
    const shuffled = [...distractors].sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [answer, ...shuffled].sort(() => Math.random() - 0.5);
    const personLabel = PERSON_LABELS[person] || person;
    const { label: tenseLabel, particle } = getTenseLabel(t);

    const prompt = t === 'imperative'
      ? `${tenseLabel} — to ${personLabel}`
      : `${personLabel} — ${tenseLabel}`;

    return {
      prompt,
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

  const startSRS = useCallback(() => {
    const item = getNextSRSItem(verbs, null, { selectedPersons });
    if (!item) {
      setSrsActive(true);
      setSrsItem(null);
      setSrsQuestion(null);
      return;
    }
    const q = buildSRSQuestion(item);
    setSrsActive(true);
    setSrsItem(item);
    setSrsQuestion(q);
    setSelectedAnswer(null);
    setConfidence(3);
    setSrsSubmitted(false);
    setSrsFeedback(null);
    setSrsScore(0);
    setSrsTotal(0);
    setLastItem(null);
    setRemedialState(null);
  }, [verbs, selectedPersons, buildSRSQuestion]);

  const submitSRSAnswer = () => {
    if (!selectedAnswer || !srsQuestion || !srsItem) return;

    const isCorrect = selectedAnswer === srsQuestion.answer;
    const { isConfidentError } = mapConfidenceOutcome(confidence, isCorrect);

    // Update FSRS state
    const card = getCard(srsItem.verb.id);
    const daysSince = card.last_review
      ? (new Date() - new Date(card.last_review)) / (1000 * 60 * 60 * 24)
      : 0;
    const updatedCard = updateCard(card, daysSince, confidence, isCorrect);
    saveCard(srsItem.verb.id, updatedCard);

    setSrsSubmitted(true);
    setSrsFeedback({ correct: isCorrect, answer: srsQuestion.answer, alt: srsQuestion.answer_alt });
    setSrsTotal(t => t + 1);
    if (isCorrect) setSrsScore(s => s + 1);

    // Build example sentence
    const correctForm = srsItem.verb.conjugations?.[srsQuestion.tense]?.forms
      ?.find(f => f.person === srsQuestion.person);
    if (correctForm) {
      setSrsExampleSentence(buildExampleSentence({
        tense: srsQuestion.tense,
        person: srsQuestion.person,
        correctTranslit: correctForm.translit,
        verbEnglish: srsItem.verb.verb.english,
        particle: srsQuestion.particle,
      }));
    }

    // Trigger remedial path for confident errors
    if (isConfidentError) {
      setRemedialState({
        verb: srsItem.verb,
        tense: srsQuestion.tense,
        person: srsQuestion.person,
        wrongAnswer: selectedAnswer,
        correctAnswer: srsQuestion.answer,
      });
    }
  };

  const nextSRSQuestion = () => {
    const newLastItem = srsItem ? { verbId: srsItem.verb.id, tense: srsQuestion?.tense } : null;
    const item = getNextSRSItem(verbs, newLastItem, { selectedPersons });
    if (!item) {
      setSrsItem(null);
      setSrsQuestion(null);
      return;
    }
    const q = buildSRSQuestion(item);
    setSrsItem(item);
    setSrsQuestion(q);
    setSelectedAnswer(null);
    setConfidence(3);
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

  // Due count for display
  const dueCount = srsMode ? getDueCountFromScheduler(verbs) : 0;
  const newCount = srsMode ? getNewCount(verbs) : 0;

  // Setup screen
  if (!questions && !srsActive) {
    return (
      <div className="page quiz-page">
        <h2>Quiz Settings</h2>
        <div className="quiz-setup">
          {/* SRS Mode Toggle */}
          <label className="toggle-label srs-toggle">
            <input
              type="checkbox"
              checked={srsMode}
              onChange={toggleSrsMode}
            />
            SRS Mode (spaced repetition)
          </label>

          {srsMode && (
            <div className="srs-stats-bar">
              <span className="srs-stat">{dueCount} due</span>
              <span className="srs-stat">{newCount} new</span>
            </div>
          )}

          {!srsMode && (
            <>
              <label>
                Quiz type
                <div className="chip-group">
                  {QUIZ_TYPES.map(t => (
                    <button
                      key={t.value}
                      className={`chip ${quizType === t.value ? 'active' : ''}`}
                      onClick={() => setQuizType(t.value)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </label>
            </>
          )}

          {(quizType === 'conjugation' || srsMode) && (
            <>
              {!srsMode && (
                <label>
                  Tense
                  <div className="chip-group">
                    {TENSE_OPTIONS.map(t => (
                      <button
                        key={t.value}
                        className={`chip ${tense === t.value ? 'active' : ''}`}
                        onClick={() => setTense(t.value)}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </label>
              )}

              <label>
                Subjects
                <button
                  className="subject-toggle-btn"
                  onClick={() => setShowPersons(s => !s)}
                >
                  {selectedPersons.length === PERSONS.length
                    ? 'All subjects'
                    : `${selectedPersons.length} of ${PERSONS.length} selected`}
                  <span className={`subject-arrow ${showPersons ? 'open' : ''}`}>&#9662;</span>
                </button>
                {showPersons && (
                  <div className="chip-group person-chips">
                    {PERSONS.map(p => (
                      <button
                        key={p}
                        className={`chip ${selectedPersons.includes(p) ? 'active' : ''}`}
                        onClick={() => togglePerson(p)}
                      >
                        {PERSON_LABELS[p]}
                      </button>
                    ))}
                  </div>
                )}
              </label>
            </>
          )}

          {!srsMode && (
            <>
              <label>
                Questions: {numQuestions}
                <input
                  type="range"
                  min={5}
                  max={20}
                  value={numQuestions}
                  onChange={e => setNumQuestions(+e.target.value)}
                />
              </label>

              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={useArabic}
                  onChange={e => setUseArabic(e.target.checked)}
                />
                Arabic script prompts
              </label>
            </>
          )}

          <button className="start-btn" onClick={srsMode ? startSRS : startQuiz}>
            {srsMode ? 'Start SRS Review' : 'Start Quiz'}
          </button>
        </div>
      </div>
    );
  }

  // --- SRS Active ---
  if (srsActive) {
    // Remedial sequence
    if (remedialState) {
      return (
        <div className="page quiz-page">
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

    // No more items
    if (!srsQuestion) {
      return (
        <div className="page quiz-page">
          <div className="quiz-complete">
            <h2>No verbs due for review</h2>
            {srsTotal > 0 && (
              <>
                <div className="final-score">
                  <span className="score-num">{srsScore}</span>
                  <span className="score-denom">/ {srsTotal}</span>
                </div>
                <div className="score-pct">{Math.round((srsScore / srsTotal) * 100)}%</div>
              </>
            )}
            <button className="start-btn" onClick={() => setSrsActive(false)}>Back to Settings</button>
          </div>
        </div>
      );
    }

    return (
      <div className="page quiz-page">
        <div className="srs-progress-bar">
          <span className="srs-stat">Score: {srsScore}/{srsTotal}</span>
          <span className="srs-stat">{getDueCountFromScheduler(verbs)} due</span>
        </div>

        {srsQuestion.verb_info && (
          <div className="verb-info-bar">
            <span className="vi-translit">{srsQuestion.verb_info.translit}</span>
            <span className="vi-arabic" dir="rtl">{srsQuestion.verb_info.arabic}</span>
            <span className="vi-english">{srsQuestion.verb_info.english}</span>
          </div>
        )}

        <div className="quiz-prompt">{srsQuestion.prompt}</div>

        <div className="options">
          {srsQuestion.options.map((opt, i) => (
            <button
              key={i}
              className={`option-btn ${
                srsSubmitted
                  ? opt === srsQuestion.answer
                    ? 'correct'
                    : opt === selectedAnswer && !srsFeedback?.correct
                      ? 'wrong'
                      : ''
                  : opt === selectedAnswer
                    ? 'selected'
                    : ''
              }`}
              onClick={() => !srsSubmitted && setSelectedAnswer(opt)}
              disabled={srsSubmitted}
            >
              {opt}
            </button>
          ))}
        </div>

        {!srsSubmitted && (
          <>
            <ConfidenceSlider value={confidence} onChange={setConfidence} />
            <button
              className={`start-btn submit-btn ${selectedAnswer ? '' : 'disabled'}`}
              onClick={submitSRSAnswer}
              disabled={!selectedAnswer}
            >
              Submit Answer
            </button>
          </>
        )}

        {srsFeedback && !remedialState && (
          <div className={`feedback ${srsFeedback.correct ? 'correct' : 'wrong'}`}>
            <div className="feedback-header">
              {srsFeedback.correct ? '✓ Correct!' : `✗ The answer was: ${srsFeedback.answer}`}
              {srsFeedback.alt && <span className="feedback-alt"> = {srsFeedback.alt}</span>}
            </div>
            {srsExampleSentence && (
              <div className="example-sentence">
                <p className="example-translit">
                  {srsExampleSentence.sentence}
                  <span className="speaker-icon disabled" title="Audio coming soon">🔊</span>
                </p>
                <p className="example-english">{srsExampleSentence.english}</p>
              </div>
            )}
            <button className="next-btn" onClick={nextSRSQuestion}>Next Question</button>
          </div>
        )}
      </div>
    );
  }

  // --- Free Practice Active ---
  // Quiz complete
  if (idx >= questions.length) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="page quiz-page">
        <Lightsaber level={level} maxLevel={questions.length} />
        <div className="quiz-complete">
          <h2>{level >= questions.length ? 'LIGHTSABER FULLY CHARGED!' : 'Quiz Complete!'}</h2>
          <div className="final-score">
            <span className="score-num">{score}</span>
            <span className="score-denom">/ {questions.length}</span>
          </div>
          <div className="score-pct">{pct}%</div>
          <button className="start-btn" onClick={() => setQuestions(null)}>New Quiz</button>
        </div>
      </div>
    );
  }

  const q = questions[idx];

  return (
    <div className="page quiz-page">
      <Lightsaber level={level} maxLevel={questions.length} />

      <div className="quiz-progress">Q{idx + 1} / {questions.length}</div>

      {q.verb_info && (
        <div className="verb-info-bar">
          <span className="vi-translit">{q.verb_info.translit}</span>
          <span className="vi-arabic" dir="rtl">{q.verb_info.arabic}</span>
          <span className="vi-english">{q.verb_info.english}</span>
        </div>
      )}

      <div className="quiz-prompt" dir={useArabic ? "rtl" : "ltr"}>{q.prompt}</div>
      {q.prompt_english && <div className="quiz-prompt-en">{q.prompt_english}</div>}

      {q.hint && <div className="quiz-hint">Hint: {q.hint}</div>}

      {q.example && (
        <div className="quiz-example">
          <p dir="rtl">{q.example.arabic}</p>
          {q.example.translit && <p className="quiz-example-translit">{q.example.translit}</p>}
          <p>{q.example.english}</p>
        </div>
      )}

      <div className="options">
        {q.options.map((opt, i) => (
          <button
            key={i}
            className={`option-btn ${
              feedback
                ? opt === q.answer
                  ? 'correct'
                  : feedback.correct
                    ? ''
                    : 'wrong'
                : ''
            }`}
            onClick={() => !feedback && handleAnswer(opt)}
            disabled={!!feedback}
          >
            {opt}
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`feedback ${feedback.correct ? 'correct' : 'wrong'}`}>
          <div className="feedback-header">
            {feedback.correct ? '✓ Correct!' : `✗ The answer was: ${feedback.answer}`}
            {feedback.alt && <span className="feedback-alt"> = {feedback.alt}</span>}
          </div>
          {exampleSentence && (
            <div className="example-sentence">
              <p className="example-translit">
                {exampleSentence.sentence}
                <span className="speaker-icon disabled" title="Audio coming soon">🔊</span>
              </p>
              <p className="example-english">{exampleSentence.english}</p>
            </div>
          )}
          <button className="next-btn" onClick={nextQuestion}>Next Question</button>
        </div>
      )}
    </div>
  );
}
