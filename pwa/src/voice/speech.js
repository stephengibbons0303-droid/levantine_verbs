// Swappable voice layer for the Talk tab.
//
// Today it runs on-device through the browser Web Speech API:
//   - TTS (hear a line)  = window.speechSynthesis, preferring an Arabic ('ar') voice.
//                          This is genuinely local — no network, works in the deployed PWA.
//   - STT (say a line)   = window.SpeechRecognition / webkitSpeechRecognition, lang ar-LB.
//                          NOTE: in Chrome this streams the mic audio to Google's servers —
//                          it is NOT truly local or private, and needs a connection. Firefox
//                          has no support. This is the seam we swap for a local Whisper (or a
//                          fine-tuned Lebanese) engine later: implement the same shape below
//                          and point `sttEngine` / `ttsEngine` at it.
//
// The expected/heard comparison lives here too (normalizeArabic + scoreArabic) so the UI
// stays dumb.

// ---------------------------------------------------------------- capability probes

export function ttsAvailable() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function sttAvailable() {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
}

// ---------------------------------------------------------------- TTS (browser)

let _voicesReady = null;

function loadVoices() {
  if (_voicesReady) return _voicesReady;
  _voicesReady = new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const now = synth.getVoices();
    if (now && now.length) return resolve(now);
    const done = () => resolve(synth.getVoices());
    synth.addEventListener('voiceschanged', done, { once: true });
    // Safety net: some browsers never fire voiceschanged.
    setTimeout(() => resolve(synth.getVoices()), 1000);
  });
  return _voicesReady;
}

async function pickArabicVoice() {
  const voices = await loadVoices();
  if (!voices || !voices.length) return null;
  // Prefer an explicit Arabic voice; fall back to anything tagged 'ar'.
  return (
    voices.find((v) => /^ar([-_]|$)/i.test(v.lang)) ||
    voices.find((v) => /arabic/i.test(v.name)) ||
    null
  );
}

// ---------------------------------------------------------------- local Leva-TTS engine

// The Levantine XTTS service (tools/leva-tts/server.py) running on this machine.
// When reachable it is the primary voice — real Lebanese dialect. Unreachable (e.g. the
// deployed phone PWA, which can't see localhost) → we fall back to the browser voice.
const LEVA_BASE = 'http://127.0.0.1:8772';
let _levaState = null; // null = unprobed, true/false once checked
let _levaAudio = null;

export async function levaAvailable() {
  if (_levaState !== null) return _levaState;
  try {
    const r = await fetch(`${LEVA_BASE}/health`, { method: 'GET' });
    _levaState = r.ok;
  } catch {
    _levaState = false;
  }
  return _levaState;
}

async function speakLeva(text, { speaker = 'Haneen', language = 'ar' } = {}) {
  const r = await fetch(`${LEVA_BASE}/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, speaker, language }),
  });
  if (!r.ok) throw new Error('leva ' + r.status);
  const url = URL.createObjectURL(await r.blob());
  return new Promise((resolve) => {
    const a = new Audio(url);
    _levaAudio = a;
    const done = (ok) => {
      URL.revokeObjectURL(url);
      if (_levaAudio === a) _levaAudio = null;
      resolve({ spoken: ok, engine: 'leva' });
    };
    a.onended = () => done(true);
    a.onerror = () => done(false);
    a.play().catch(() => done(false));
  });
}

// ---------------------------------------------------------------- unified speak

// speak(text, opts) -> Promise that resolves when playback finishes (or is cancelled).
// Prefers the local Leva-TTS service; falls back to a browser Arabic voice.
// Levantine-only, on purpose. We do NOT fall back to the browser's MSA Arabic
// voice: an MSA reading of a dialect word (qaf as "q", no imāla, wrong vowels) is
// misleading, so we prefer silence. If leva isn't reachable, nothing plays.
// (The deployed phone app can't see the local leva service; audio there is being
// moved to pre-rendered leva clips rather than a live call.)
export async function speak(text, { lang = 'ar', speaker = 'Haneen' } = {}) {
  if (!text) return { spoken: false, reason: 'empty' };
  stopSpeaking(); // never overlap
  if (await levaAvailable()) {
    try {
      return await speakLeva(text, { speaker, language: lang });
    } catch {
      return { spoken: false, reason: 'leva-error' };
    }
  }
  return { spoken: false, reason: 'no-leva' };
}

export function stopSpeaking() {
  if (_levaAudio) {
    try { _levaAudio.pause(); } catch { /* noop */ }
    _levaAudio = null;
  }
  if (ttsAvailable()) window.speechSynthesis.cancel();
}

// Did we actually find an Arabic voice on this device? (UI can warn if not.)
export async function hasArabicVoice() {
  return !!(await pickArabicVoice());
}

// ---------------------------------------------------------------- STT (browser)

// listen(opts) -> Promise<{ transcript, confidence }>. Rejects on error/no-speech.
export function listen({ lang = 'ar-LB', maxMs = 8000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!sttAvailable()) return reject(new Error('unavailable'));
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    let settled = false;
    const finish = (fn, arg) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { rec.stop(); } catch { /* already stopped */ }
      fn(arg);
    };
    const timer = setTimeout(() => finish(reject, new Error('timeout')), maxMs);

    rec.onresult = (ev) => {
      const r = ev.results[0][0];
      finish(resolve, { transcript: r.transcript || '', confidence: r.confidence ?? null });
    };
    rec.onerror = (ev) => finish(reject, new Error(ev.error || 'error'));
    rec.onend = () => finish(reject, new Error('no-speech'));

    try { rec.start(); } catch (e) { finish(reject, e); }
  });
}

// ---------------------------------------------------------------- Arabic compare

const DIACRITICS = /[ً-ْٰـ]/g; // harakat + superscript alef + tatweel

// Fold script differences that don't change the spoken word, so a loose recognizer
// result still lines up with our stored line.
export function normalizeArabic(s) {
  if (!s) return '';
  return s
    .replace(DIACRITICS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ء/g, '')
    .replace(/ة/g, 'ه')
    .replace(/[^ء-ي\s]/g, ' ') // drop latin, digits, punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let cur = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[b.length];
}

// scoreArabic(expected, heard) -> { score: 0..1, verdict: 'match'|'close'|'off' }
export function scoreArabic(expected, heard) {
  const e = normalizeArabic(expected);
  const h = normalizeArabic(heard);
  if (!e || !h) return { score: 0, verdict: 'off' };
  const dist = levenshtein(e, h);
  const score = Math.max(0, 1 - dist / Math.max(e.length, h.length));
  const verdict = score >= 0.8 ? 'match' : score >= 0.5 ? 'close' : 'off';
  return { score, verdict };
}
