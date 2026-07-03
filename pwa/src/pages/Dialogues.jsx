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
// character, the app speaks the other parts (🔊), and on your turn you say the line
// aloud (🎤 checks you against the hidden Arabic) then reveal it to check.
// Voice runs through ../voice/speech.js — on-device browser speech today, swappable for
// a local Whisper / fine-tuned Lebanese engine later.

const isYours = (turn, role) => turn.who === role && !turn.forcedApp;
const TTS_OK = ttsAvailable();
const STT_OK = sttAvailable();

// Female characters get the female Leva voice; everyone else the male one.
const FEMALE_CHARACTERS = new Set(['Sarah']);
const speakerFor = (name) => (FEMALE_CHARACTERS.has(name) ? 'Haneen' : 'Saad');

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

  // Stop any in-flight speech when leaving a screen.
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

  const ArabicToggle = () => (
    <label className="dlg-hint-inline">
      <input type="checkbox" checked={arabic} onChange={(e) => setArabic(e.target.checked)} />
      Arabic
    </label>
  );

  // ---- Library ----
  if (phase === 'library') {
    return (
      <div className="page dlg-page">
        <p className="dlg-eyebrow">Speaking practice · play along</p>
        <h2 className="dlg-title">Dialogues</h2>
        <p className="dlg-blurb">
          Pick a conversation. You take one character; the app speaks the others, and on your turn you
          say the line in Lebanese, then reveal it to check.
        </p>
        <div className="dlg-lib-grid">
          {DIALOGUES.map((d) => (
            <button key={d.id} className="dlg-lib-card" onClick={() => openDialogue(d.id)}>
              <span className="dlg-lib-num">Dialogue {d.number}</span>
              <span className="dlg-lib-title">{d.title}</span>
              <span className="dlg-lib-blurb">{d.blurb}</span>
              <span className="dlg-lib-meta">
                {d.turns[d.turns.length - 1].n} turns · play {d.playable.map((r) => d.characters[r]).join(' or ')}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---- Setup (choose character) ----
  if (phase === 'setup') {
    return (
      <div className="page dlg-page">
        <button className="dlg-back" onClick={backToLibrary}>← All dialogues</button>
        <p className="dlg-eyebrow">Dialogue {dialogue.number}</p>
        <h2 className="dlg-title">{dialogue.title}</h2>
        <p className="dlg-blurb">{dialogue.blurb}</p>
        <p className="dlg-picklabel">Who will you play?</p>
        <div className="dlg-picks">
          {dialogue.playable.map((r) => (
            <button key={r} className="dlg-pick" onClick={() => start(r)}>
              <span className="dlg-pick-name">{dialogue.characters[r]}</span>
              <span className="dlg-pick-role">{dialogue.roleHints[r]}</span>
              <span className="dlg-pick-go">Play as {dialogue.characters[r]} →</span>
            </button>
          ))}
        </div>
        <div className="dlg-setup-toggles">
          <label className="dlg-hint-toggle">
            <input type="checkbox" checked={hints} onChange={(e) => setHints(e.target.checked)} />
            Show the English underneath
          </label>
          <label className="dlg-hint-toggle">
            <input type="checkbox" checked={arabic} onChange={(e) => setArabic(e.target.checked)} />
            Show the Arabic script too
          </label>
        </div>
      </div>
    );
  }

  // ---- Done ----
  if (phase === 'done') {
    return (
      <div className="page dlg-page dlg-done">
        <div className="dlg-done-emoji">🎬</div>
        <h2>Scene complete</h2>
        <p>You played “{dialogue.title}” through. Try it again as the other character, or pick another dialogue.</p>
        <div className="dlg-done-actions">
          <button className="start-btn" onClick={() => start(role)}>Play again</button>
          <button className="dlg-btn-soft" onClick={() => setPhase('setup')}>Switch character</button>
          <button className="dlg-btn-soft" onClick={backToLibrary}>All dialogues</button>
        </div>
      </div>
    );
  }

  // ---- Play ----
  const progress = Math.round((cursor / turns.length) * 100);
  return (
    <div className="page dlg-page">
      <div className="dlg-topbar">
        <button className="dlg-back" onClick={backToLibrary}>←</button>
        <span className="dlg-role-chip">{dialogue.title} · {dialogue.characters[role]}</span>
        <label className="dlg-hint-inline">
          <input type="checkbox" checked={hints} onChange={(e) => setHints(e.target.checked)} />
          English
        </label>
        <ArabicToggle />
        <button className="dlg-restart" onClick={() => start(role)}>Restart</button>
      </div>
      <div className="dlg-progress"><i style={{ width: `${progress}%` }} /></div>

      {!voiceReady && (
        <div className="dlg-voice-note">
          🔊 needs a voice — the local Lebanese voice service isn’t running and this device has no
          Arabic browser voice. Start the leva-tts service, or add a Windows Arabic voice, then reload.
        </div>
      )}

      <div className="dlg-log">
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
          <div className="dlg-cue">
            <div className="dlg-cue-who">Your turn · {dialogue.characters[role]}</div>
            <div className="dlg-cue-say">Say in Lebanese: <b>{pending.en}</b></div>
            <div className="dlg-cue-tip">Say it aloud, then reveal to check.</div>
            <div className="dlg-actions">
              <button className="dlg-btn" onClick={reveal}>Reveal the Lebanese</button>
              <button
                className={`dlg-mic ${mic.state === 'listening' ? 'live' : ''}`}
                onClick={runMic}
                disabled={!STT_OK || mic.state === 'listening'}
                title={STT_OK ? 'Say your line — I\'ll check it' : 'Speech input not supported in this browser'}
              >
                {mic.state === 'listening' ? '● listening' : '🎤'}
              </button>
            </div>
            {mic.state === 'done' && (
              <div className={`dlg-mic-fb ${mic.verdict}`}>
                <span className="dlg-mic-verdict">
                  {mic.verdict === 'match' ? 'Nailed it' : mic.verdict === 'close' ? 'Close — try again' : 'Not quite'}
                </span>
                {mic.heard && <span className="dlg-mic-heard" dir="rtl" lang="ar">{mic.heard}</span>}
              </div>
            )}
            {mic.state === 'error' && (
              <div className="dlg-mic-fb off">
                <span className="dlg-mic-verdict">
                  {mic.verdict === 'no-speech' || mic.verdict === 'timeout'
                    ? 'Didn\'t catch that — try again'
                    : 'Mic unavailable'}
                </span>
              </div>
            )}
          </div>
        )}
        {mode === 'continue' && (
          <div className="dlg-actions">
            <button className="dlg-btn" onClick={advance}>Continue ▸</button>
          </div>
        )}
        {mode === 'finish' && (
          <div className="dlg-actions">
            <button className="dlg-btn" onClick={() => setPhase('done')}>Finish ▸</button>
          </div>
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
    <div className={`dlg-row ${yours ? 'you' : 'them'}`}>
      <div className="dlg-bubble">
        <div className="dlg-spk">
          {name}{yours ? ' · you' : ''}
          {TTS_OK && (
            <button
              className={`dlg-speak ${speaking ? 'live' : ''}`}
              onClick={hear}
              title="Hear this line"
              aria-label="Hear this line"
            >
              {speaking ? '⏸' : '🔊'}
            </button>
          )}
        </div>
        <div className="dlg-leb">{turn.leb}</div>
        {arabic && turn.ar && <div className="dlg-ar" dir="rtl" lang="ar">{turn.ar}</div>}
        {hints && <div className="dlg-en">{turn.en}</div>}
      </div>
    </div>
  );
}
