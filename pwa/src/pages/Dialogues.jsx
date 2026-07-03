import { useState, useRef, useEffect, useCallback } from 'react';
import { DIALOGUES } from '../data/dialogues';

// Talk / Dialogues tab.
// A library of dialogues, each a read-and-reveal play-along: pick a dialogue, pick a
// character, the app speaks the other parts, and on your turn you say the line aloud
// then reveal it to check yourself.
// The 🔊 (hear) and 🎤 (record) buttons are placeholders for the voice + speech-to-text
// models, wired up later. They are intentionally disabled for now.

const isYours = (turn, role) => turn.who === role && !turn.forcedApp;

export default function Dialogues() {
  const [phase, setPhase] = useState('library'); // 'library' | 'setup' | 'play' | 'done'
  const [dialogueId, setDialogueId] = useState(null);
  const [role, setRole] = useState(null);
  const [hints, setHints] = useState(true);
  const [log, setLog] = useState([]); // [{ turn, yours }]
  const [cursor, setCursor] = useState(0);
  const [pending, setPending] = useState(null);
  const [mode, setMode] = useState('reveal'); // 'reveal' | 'continue' | 'finish'

  const dialogue = DIALOGUES.find((d) => d.id === dialogueId) || null;
  const turns = dialogue ? dialogue.turns : [];

  const endRef = useRef(null);
  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [log, mode]);

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
    setPhase('library');
    setDialogueId(null);
    setRole(null);
    setLog([]);
    setCursor(0);
    setPending(null);
  };

  const start = (r) => {
    const { items, cursor: c, pending: p, done } = collectApp(0, r, turns);
    setRole(r);
    setLog(items.map((t) => ({ turn: t, yours: false })));
    setCursor(c);
    setPending(p);
    setMode('reveal');
    setPhase(done ? 'done' : 'play');
  };

  const reveal = () => {
    setLog((prev) => [...prev, { turn: pending, yours: true }]);
    const nc = cursor + 1;
    setCursor(nc);
    setPending(null);
    setMode(nc >= turns.length ? 'finish' : 'continue');
  };

  const advance = () => {
    const { items, cursor: c, pending: p, done } = collectApp(cursor, role, turns);
    setLog((prev) => [...prev, ...items.map((t) => ({ turn: t, yours: false }))]);
    setCursor(c);
    setPending(p);
    if (done) setPhase('done');
    else setMode('reveal');
  };

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
        <label className="dlg-hint-toggle">
          <input type="checkbox" checked={hints} onChange={(e) => setHints(e.target.checked)} />
          Show the English underneath
        </label>
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
        <button className="dlg-restart" onClick={() => start(role)}>Restart</button>
      </div>
      <div className="dlg-progress"><i style={{ width: `${progress}%` }} /></div>

      <div className="dlg-log">
        {log.map((item, i) => (
          <Bubble key={i} turn={item.turn} yours={item.yours} name={dialogue.characters[item.turn.who]} hints={hints} />
        ))}

        {mode === 'reveal' && pending && (
          <div className="dlg-cue">
            <div className="dlg-cue-who">Your turn · {dialogue.characters[role]}</div>
            <div className="dlg-cue-say">Say in Lebanese: <b>{pending.en}</b></div>
            <div className="dlg-cue-tip">Say it aloud, then reveal to check.</div>
            <div className="dlg-actions">
              <button className="dlg-btn" onClick={reveal}>Reveal the Lebanese</button>
              <button className="dlg-mic" disabled title="Recording — coming soon">🎤</button>
            </div>
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

function Bubble({ turn, yours, name, hints }) {
  return (
    <div className={`dlg-row ${yours ? 'you' : 'them'}`}>
      <div className="dlg-bubble">
        <div className="dlg-spk">
          {name}{yours ? ' · you' : ''}
          {!yours && (
            <button className="dlg-speak" disabled title="Hear this line — coming soon">🔊</button>
          )}
        </div>
        <div className="dlg-leb">{turn.leb}</div>
        {hints && <div className="dlg-en">{turn.en}</div>}
      </div>
    </div>
  );
}
