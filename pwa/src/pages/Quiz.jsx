import { useState, useCallback } from 'react';
import { generateQuiz } from '../utils/quizGenerator';
import { PERSONS, PERSON_LABELS } from '../utils/constants';
import Lightsaber from '../components/Lightsaber';

const QUIZ_TYPES = [
  { value: 'conjugation', label: 'Conjugation' },
  { value: 'ar2en', label: 'Arabic \u2192 English' },
  { value: 'en2ar', label: 'English \u2192 Arabic' },
];

const TENSE_OPTIONS = [
  { value: 'all', label: 'All tenses' },
  { value: 'perfect', label: 'Past (perfect)' },
  { value: 'bi_imperfect', label: 'Present (bi-imperfect)' },
  { value: 'imperfect', label: 'Dependent (imperfect)' },
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

export default function Quiz({ verbs }) {
  const [quizType, setQuizType] = useState('conjugation');
  const [tense, setTense] = useState('all');
  const [numQuestions, setNumQuestions] = useState(10);
  const [useArabic, setUseArabic] = useState(false);
  const [selectedPersons, setSelectedPersons] = useState(loadPersons);
  const [showPersons, setShowPersons] = useState(false);

  const [questions, setQuestions] = useState(null);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const togglePerson = (person) => {
    setSelectedPersons(prev => {
      const next = prev.includes(person)
        ? prev.filter(p => p !== person)
        : [...prev, person];
      // Don't allow deselecting all
      if (next.length === 0) return prev;
      localStorage.setItem('quiz_persons', JSON.stringify(next));
      return next;
    });
  };

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
  };

  const nextQuestion = () => {
    setFeedback(null);
    setIdx(i => i + 1);
  };

  // Setup screen
  if (!questions) {
    return (
      <div className="page quiz-page">
        <h2>Quiz Settings</h2>
        <div className="quiz-setup">
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

          {quizType === 'conjugation' && (
            <>
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

          <button className="start-btn" onClick={startQuiz}>Start Quiz</button>
        </div>
      </div>
    );
  }

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
          <span dir="rtl">{q.example.arabic}</span> — {q.example.english}
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
          {feedback.correct ? 'Correct!' : `Wrong. Answer: ${feedback.answer}`}
          {feedback.alt && ` = ${feedback.alt}`}
          <button className="next-btn" onClick={nextQuestion}>Next</button>
        </div>
      )}
    </div>
  );
}
