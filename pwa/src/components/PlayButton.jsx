import { useState } from 'react';
import { speak, stopSpeaking } from '../voice/speech';

// Red voice button (Sanober). Reused by verb rows (soft/sm+md) and the
// verb-detail hero (solid/lg). Speaks the given Arabic text; a second tap stops.
export default function PlayButton({ text, size = 'md', variant = 'soft', speaker, label = 'Hear' }) {
  const [speaking, setSpeaking] = useState(false);

  const onClick = async (e) => {
    e.stopPropagation();
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    try {
      await speak(text, speaker ? { speaker } : undefined);
    } finally {
      setSpeaking(false);
    }
  };

  const cls = ['sn-play', size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : '', variant === 'solid' ? 'solid' : '', speaking ? 'speaking' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <button className={cls} onClick={onClick} aria-label={speaking ? 'Stop' : label}>
      <span className="tri" />
    </button>
  );
}
