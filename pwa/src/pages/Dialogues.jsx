import { useState, useRef, useEffect, useCallback } from 'react';
import { DIALOGUES } from '../data/dialogues';
import {
  speak,
  stopSpeaking,
  listen,
  scoreArabic,
  ttsAvailable,
  sttAvailable,
  hasArabicVoice,
  levaAvailable,
} from '../voice/speech';

// Talk / Dialogues tab.
// A library of dialogues, each a read-and-reveal play-along: pick a dialogue, pick a
// character, the app speaks the other parts (red TTS), and on your turn you say the line
// aloud (red mic checks you against the hidden Arabic) then reveal it to check.

const isYours = (turn, role) => turn.who === role && !turn.forcedApp;
const TTS_OK = ttsAvailable();
const STT_OK = sttAvailable();

// Female characters get the female Leva voice; everyone else the male one.
const FEMALE_CHARACTERS = new Set(['Sarah']);
const speakerFor = (name) => (FEMALE_CHARACTERS.has(name) ? 'Haneen' : 'Saad');

function MicIcon() {
  return (
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true">
      <rect x="6" y="1" width="6" height="10" rx="3" fill="currentColor" />
      <path d="M3.2 9a5.8 5.8 0 0 0 11.6 0" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <line x1="9" y1="15" x2="9" y2="19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Dialogues() {
  const [phase, setPhase] = useState('library'); // 'library' | 'setup' | 'play' | 'done'
  const [dialogueId, setDialogueId] = useState(null);
  const [role, setRole] = useState(null);
  const [hints, setHints] = useState(true);
  const [arabic, setArabic] = useState(false); // show the Arabic script on revealed lines
  const [log, setLog] = useState([]); // [{ turn, yours }]
  const [cursor, setCursor] = useState(0);
  const [pending, setPending] = useState(null);
  const [mode, setMode] = useState('reveal'); // 'reveal' | 'continue' | 'finish'
  const [mic, setMic] = useState({ state: 'idle', heard: '', verdict: null }); // your-turn check
  const [voiceReady, setVoiceReady] = useState(true); // any Arabic voice path available?

  useEffect(() => {
    (async () => {
      if (await levaAvailable()) return setVoiceReady(true); // local Levantine service
      setVoiceReady(TTS_OK ? await hasArabicVoice() : false); // else a browser Arabic voice
    })();
  }, []);

  const dialogue = DIALOGUES.find((d) => d.id === dialogueId) || null;
  const turns = dialogue ? dialogue.turns : [];

  const endRef = useRef(null);
  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [log, mode]);

  useEffect(() => () => stopSpeaking(), []);

  const resetMic = () => setMic({ state: 'idle', heard: '', verdict: null });

  const collectApp = useCallback((from, r, ts) => {
    const items = [];
    let c = from;
    while (c < ts.length && !isYours(ts[c], r)) {
      items.push(ts[c]);
      c++;
    }
    if (c >= ts.length) return { items, cursor: c, pending: null, done: true };
    return { items, cursor: c, pending: ts[c], done: false };
  }, []);

  const openDialogue = (id) => {
    setDialogueId(id);
    setRole(null);
    setPhase('setup');
  };

  const backToLibrary = () => {
    stopSpeaking();
    setPhase('library');
    setDialogueId(null);
    setRole(null);
    setLog([]);
    setCursor(0);
    setPending(null);
    resetMic();
  };

  const start = (r) => {
    stopSpeaking();
    const { items, cursor: c, pending: p, done } = collectApp(0, r, turns);
    setRole(r);
    setLog(items.map((t) => ({ turn: t, yours: false })));
    setCursor(c);
    setPending(p);
    setMode('reveal');
    resetMic();
    setPhase(done ? 'done' : 'play');
  };

  const reveal = () => {
    setLog((prev) => [...prev, { turn: pending, yours: true }]);
    const nc = cursor + 1;
    setCursor(nc);
    setPending(null);
    resetMic();
    setMode(nc >= turns.length ? 'finish' : 'continue');
  };

  const advance = () => {
    const { items, cursor: c, pending: p, done } = collectApp(cursor, role, turns);
    setLog((prev) => [...prev, ...items.map((t) => ({ turn: t, yours: false }))]);
    setCursor(c);
    setPending(p);
    resetMic();
    if (done) setPhase('done');
    else setMode('reveal');
  };

  const runMic = async () => {
    if (!STT_OK || !pending) return;
    setMic({ state: 'listening', heard: '', verdict: null });
    try {
      const { transcript } = await listen({ lang: 'ar-LB' });
      const { verdict } = scoreArabic(pending.ar, transcript);
      setMic({ state: 'done', heard: transcript, verdict });
    } catch (e) {
      setMic({ state: 'error', heard: '', verdict: e.message || 'error' });
    }
  };

  const Check = ({ checked, onChange, children }) => (
    <label className="sn-tk-check">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="box" />
      {children}
    </label>
  );

  // ---- Library ----
  if (phase === 'library') {
    return (
      <div className="sn-tk">
        <div className="sn-tk-eyebrow">Play along</div>
        <div className="sn-tk-head">
          <h1 className="sn-tk-title" dir="rtl">حوار</h1>
          <span className="sn-tk-sub">Dialogues</span>
          <span className="sn-tk-mark" aria-hidden="true" />
        </div>
        <div className="sn-tk-cards">
          {DIALOGUES.map((d) => (
            <button key={d.id} className="sn-tk-card" onClick={() => openDialogue(d.id)}>
              <div className="sn-tk-card-top">
                <span className="sn-tk-card-num">Dialogue {d.number}</span>
                <span className="sn-tk-card-turns">{d.turns[d.turns.length - 1].n} turns</span>
              </div>
              <div className="sn-tk-card-title">{d.title}</div>
              <div className="sn-tk-card-blurb">{d.blurb}</div>
              <div className="sn-tk-card-foot">
                <span className="sn-tk-play-label">play</span>
                {d.playable.map((r) => (
                  <span key={r} className="sn-tk-role">{d.characters[r]}</span>
                ))}
                <span className="sn-tk-card-play"><span className="tri" /></span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---- Setup (choose character) ----
  if (phase === 'setup') {
    return (
      <div className="sn-tk">
        <button className="sn-tk-back" onClick={backToLibrary}>← All dialogues</button>
        <div className="sn-tk-eyebrow">Dialogue {dialogue.number}</div>
        <div className="sn-tk-head">
          <h1 className="sn-tk-title" style={{ fontFamily: 'var(--f-serif)', fontSize: '26px', fontWeight: 600, direction: 'ltr' }}>{dialogue.title}</h1>
        </div>
        <p className="sn-tk-card-blurb" style={{ marginTop: 0, marginBottom: '8px' }}>{dialogue.blurb}</p>
        <div className="sn-tk-picklabel">Who will you play?</div>
        <div className="sn-tk-picks">
          {dialogue.playable.map((r) => (
            <button key={r} className="sn-tk-pick" onClick={() => start(r)}>
              <span className="sn-tk-pick-name">{dialogue.characters[r]}</span>
              <span className="sn-tk-pick-role">{dialogue.roleHints[r]}</span>
              <span className="sn-tk-pick-go">Play as {dialogue.characters[r]} →</span>
            </button>
          ))}
        </div>
        <div className="sn-tk-setup-toggles">
          <Check checked={hints} onChange={(e) => setHints(e.target.checked)}>Show the English underneath</Check>
          <Check checked={arabic} onChange={(e) => setArabic(e.target.checked)}>Show the Arabic script too</Check>
        </div>
      </div>
    );
  }

  // ---- Done ----
  if (phase === 'done') {
    return (
      <div className="sn-tk sn-tk-done">
        <div className="sn-tk-done-emoji">🎬</div>
        <h2>Scene complete</h2>
        <p>You played “{dialogue.title}” through. Try it again as the other character, or pick another dialogue.</p>
        <div className="sn-tk-done-actions">
          <button className="sn-tk-advance" style={{ width: 'auto', padding: '12px 18px' }} onClick={() => start(role)}>Play again</button>
          <button className="sn-tk-btn-soft" onClick={() => setPhase('setup')}>Switch character</button>
          <button className="sn-tk-btn-soft" onClick={backToLibrary}>All dialogues</button>
        </div>
      </div>
    );
  }

  // ---- Play ----
  return (
    <div className="sn-tk">
      <div className="sn-tk-topbar">
        <div className="sn-tk-topbar-lead">
          <button className="sn-tk-topbar-back" onClick={backToLibrary} aria-label="Back" />
          <div style={{ minWidth: 0 }}>
            <div className="sn-tk-conv-title">{dialogue.title}</div>
            <div className="sn-tk-conv-role">playing {dialogue.characters[role]}</div>
          </div>
        </div>
        <div className="sn-tk-topright">
          <Check checked={hints} onChange={(e) => setHints(e.target.checked)}>EN</Check>
          <Check checked={arabic} onChange={(e) => setArabic(e.target.checked)}>عربي</Check>
          <button className="sn-tk-restart" onClick={() => start(role)}>Restart</button>
        </div>
      </div>

      {!voiceReady && (
        <div className="sn-tk-voice-note">
          Audio needs the local Lebanese voice — the leva-tts service isn’t running (and there’s no MSA
          fallback by design). Start it, then reload.
        </div>
      )}

      <div className="sn-tk-log">
        {log.map((item, i) => (
          <Bubble
            key={i}
            turn={item.turn}
            yours={item.yours}
            name={dialogue.characters[item.turn.who]}
            hints={hints}
            arabic={arabic}
          />
        ))}

        {mode === 'reveal' && pending && (
          <div className="sn-tk-cue">
            <div className="sn-tk-cue-who">Your turn · {dialogue.characters[role]}</div>
            <div className="sn-tk-cue-say">Say in Lebanese: <span className="target">{pending.en}</span></div>
            <div className="sn-tk-cue-tip">Say it aloud, then reveal to check.</div>
            <div className="sn-tk-cue-actions">
              <button className="sn-tk-reveal" onClick={reveal}>Reveal the Lebanese</button>
              <button
                className={`sn-tk-mic ${mic.state === 'listening' ? 'live' : ''}`}
                onClick={runMic}
                disabled={!STT_OK || mic.state === 'listening'}
                aria-label={STT_OK ? 'Say your line' : 'Speech input not supported'}
              >
                <MicIcon />
              </button>
            </div>
            {mic.state === 'done' && (
              <div className={`sn-tk-mic-fb ${mic.verdict}`}>
                <span className="sn-tk-mic-verdict">
                  {mic.verdict === 'match' ? 'Nailed it' : mic.verdict === 'close' ? 'Close — try again' : 'Not quite'}
                </span>
                {mic.heard && <span className="sn-tk-mic-heard" dir="rtl" lang="ar">{mic.heard}</span>}
              </div>
            )}
            {mic.state === 'error' && (
              <div className="sn-tk-mic-fb off">
                <span className="sn-tk-mic-verdict">
                  {mic.verdict === 'no-speech' || mic.verdict === 'timeout'
                    ? 'Didn’t catch that — try again'
                    : 'Mic unavailable'}
                </span>
              </div>
            )}
          </div>
        )}
        {mode === 'continue' && (
          <button className="sn-tk-advance" onClick={advance}>Continue ▸</button>
        )}
        {mode === 'finish' && (
          <button className="sn-tk-advance" onClick={() => setPhase('done')}>Finish ▸</button>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}

function Bubble({ turn, yours, name, hints, arabic }) {
  const [speaking, setSpeaking] = useState(false);
  const hear = async () => {
    if (speaking) { stopSpeaking(); setSpeaking(false); return; }
    setSpeaking(true);
    await speak(turn.ar || turn.leb, { lang: 'ar', speaker: speakerFor(name) });
    setSpeaking(false);
  };
  return (
    <div className={`sn-tk-bubble ${yours ? 'you' : 'them'}`}>
      <div className="sn-tk-spk">
        {yours ? `${name} · you` : name}
        {!yours && (
          <button
            className={`sn-tk-speak ${speaking ? 'live' : ''}`}
            onClick={hear}
            aria-label="Hear this line"
          >
            <span className="tri" />
          </button>
        )}
      </div>
      <div className="sn-tk-leb">{turn.leb}</div>
      {arabic && turn.ar && <div className="sn-tk-ar" dir="rtl" lang="ar">{turn.ar}</div>}
      {hints && <div className="sn-tk-en">{turn.en}</div>}
    </div>
  );
}
