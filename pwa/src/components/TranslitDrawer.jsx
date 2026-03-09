import { useState, useRef, useCallback, useEffect } from 'react';

export default function TranslitDrawer() {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(null);
  const touchStart = useRef(null);
  const touchStartY = useRef(null);
  const drawerRef = useRef(null);

  const EDGE_ZONE = 30; // px from right edge to start swipe-open
  const SWIPE_THRESHOLD = 60;

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStart.current = touch.clientX;
    touchStartY.current = touch.clientY;

    if (open) {
      setDragging(true);
      setDragX(0);
    } else if (touch.clientX > window.innerWidth - EDGE_ZONE) {
      setDragging(true);
      setDragX(0);
    }
  }, [open]);

  const handleTouchMove = useCallback((e) => {
    if (!dragging || touchStart.current === null) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.current;
    const deltaY = Math.abs(touch.clientY - touchStartY.current);

    // If vertical scroll dominates, cancel drag
    if (deltaY > Math.abs(deltaX) + 10 && Math.abs(deltaX) < 20) {
      setDragging(false);
      setDragX(null);
      return;
    }

    if (open) {
      // Dragging to close (swipe right)
      setDragX(Math.max(0, deltaX));
    } else {
      // Dragging to open (swipe left from right edge)
      setDragX(Math.min(0, deltaX));
    }
  }, [dragging, open]);

  const handleTouchEnd = useCallback(() => {
    if (!dragging) {
      touchStart.current = null;
      return;
    }

    if (open) {
      if (dragX > SWIPE_THRESHOLD) setOpen(false);
    } else {
      if (dragX !== null && Math.abs(dragX) > SWIPE_THRESHOLD) setOpen(true);
    }

    setDragging(false);
    setDragX(null);
    touchStart.current = null;
  }, [dragging, dragX, open]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Calculate transform for drag preview
  let transform = open ? 'translateX(0)' : 'translateX(100%)';
  if (dragging && dragX !== null) {
    if (open) {
      transform = `translateX(${dragX}px)`;
    } else {
      // dragX is negative when swiping left to open
      const drawerWidth = window.innerWidth * 0.8;
      const offset = Math.max(0, drawerWidth + dragX);
      transform = `translateX(${offset}px)`;
    }
  }

  const transition = dragging ? 'none' : 'transform 0.3s ease';

  return (
    <>
      {open && (
        <div className="drawer-overlay" onClick={() => setOpen(false)} />
      )}
      <div
        ref={drawerRef}
        className="translit-drawer"
        style={{ transform, transition }}
      >
        <div className="drawer-header">
          <h2>Transliteration Guide</h2>
          <button className="drawer-close" onClick={() => setOpen(false)}>✕</button>
        </div>
        <div className="drawer-body">
          <p className="drawer-subtitle">Quick reference for the transliteration system used throughout the app.</p>

          <h3>Consonants</h3>
          <table className="guide-table">
            <thead>
              <tr><th>Char</th><th>Arabic</th><th>Name</th><th>Sound</th><th>Example</th></tr>
            </thead>
            <tbody>
              <tr><td>ʔ</td><td>ء</td><td>hamza</td><td>glottal stop</td><td>ʔaxad (أخد)</td></tr>
              <tr><td>ɧ</td><td>ح</td><td>ḥāʔ</td><td>emphatic h</td><td>ɧabb (حب)</td></tr>
              <tr><td>x</td><td>خ</td><td>xāʔ</td><td>kh ("loch")</td><td>xāf</td></tr>
              <tr><td>š</td><td>ش</td><td>šīn</td><td>sh ("ship")</td><td>šāf (شاف)</td></tr>
              <tr><td>3</td><td>ع</td><td>ʕayn</td><td>pharyngeal fricative</td><td>bi3raf (بعرف)</td></tr>
              <tr><td>ɣ</td><td>غ</td><td>ġayn</td><td>French r</td><td>ɣarīb (غریب)</td></tr>
              <tr><td>ş</td><td>ص</td><td>ṣād</td><td>emphatic s</td><td>şubuɧ (صُبُح)</td></tr>
              <tr><td>ʈ</td><td>ط</td><td>ṭāʔ</td><td>emphatic t</td><td>ʈálab (طَلَب)</td></tr>
              <tr><td>ɖ</td><td>ض</td><td>ḍād</td><td>emphatic d</td><td>ɖárab (ضَرَب)</td></tr>
              <tr><td>ʐ</td><td>ظ</td><td>ẓāʔ</td><td>emphatic z</td><td>būʐa (بوظة)</td></tr>
            </tbody>
          </table>
          <p className="guide-note">All other consonants (b, t, d, f, j, k, l, m, n, r, s, w, y, z, h) use standard Latin equivalents.</p>

          <h3>Short Stressed Vowels</h3>
          <table className="guide-table">
            <thead><tr><th>Char</th><th>Sound</th><th>Example</th></tr></thead>
            <tbody>
              <tr><td>á</td><td>short stressed "a"</td><td>ʈálab</td></tr>
              <tr><td>í</td><td>short stressed "i"</td><td>bíji</td></tr>
              <tr><td>ú</td><td>short stressed "u"</td><td>şúbuɧ</td></tr>
            </tbody>
          </table>

          <h3>Long Vowels</h3>
          <table className="guide-table">
            <thead><tr><th>Char</th><th>Sound</th><th>Example</th></tr></thead>
            <tbody>
              <tr><td>ā</td><td>long "a"</td><td>šāf</td></tr>
              <tr><td>ē</td><td>long "e"</td><td>jēy</td></tr>
              <tr><td>ī</td><td>long "i"</td><td>jīt</td></tr>
              <tr><td>ō</td><td>long "o"</td><td>béddo</td></tr>
              <tr><td>ū</td><td>long "u"</td><td>ṭlūb</td></tr>
            </tbody>
          </table>

          <h3>Nasal Vowels</h3>
          <table className="guide-table">
            <thead><tr><th>Char</th><th>Sound</th></tr></thead>
            <tbody>
              <tr><td>ã</td><td>nasalized "a"</td></tr>
              <tr><td>õ</td><td>nasalized "o"</td></tr>
            </tbody>
          </table>

          <h3>Unicode Reference</h3>
          <table className="guide-table unicode-table">
            <thead><tr><th>Char</th><th>Unicode</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td>á</td><td>U+00E1</td><td>A with Acute</td></tr>
              <tr><td>í</td><td>U+00ED</td><td>I with Acute</td></tr>
              <tr><td>ā</td><td>U+0101</td><td>A with Macron</td></tr>
              <tr><td>ē</td><td>U+0113</td><td>E with Macron</td></tr>
              <tr><td>ī</td><td>U+012B</td><td>I with Macron</td></tr>
              <tr><td>ō</td><td>U+014D</td><td>O with Macron</td></tr>
              <tr><td>ū</td><td>U+016B</td><td>U with Macron</td></tr>
              <tr><td>ã</td><td>U+00E3</td><td>A with Tilde</td></tr>
              <tr><td>õ</td><td>U+00F5</td><td>O with Tilde</td></tr>
              <tr><td>ɧ</td><td>U+0267</td><td>Heng</td></tr>
              <tr><td>ʔ</td><td>U+0294</td><td>Glottal Stop</td></tr>
              <tr><td>š</td><td>U+0161</td><td>S with Caron</td></tr>
              <tr><td>ɣ</td><td>U+0263</td><td>Gamma (IPA)</td></tr>
              <tr><td>ş</td><td>U+015F</td><td>S with Cedilla</td></tr>
              <tr><td>ʈ</td><td>U+0288</td><td>T Retroflex</td></tr>
              <tr><td>ɖ</td><td>U+0256</td><td>D with Tail</td></tr>
              <tr><td>ʐ</td><td>U+0290</td><td>Z Retroflex</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="drawer-edge-tab" onClick={() => setOpen(true)}>
        <span>◀</span>
      </div>
    </>
  );
}
