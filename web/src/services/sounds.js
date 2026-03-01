// Sound effects using Web Audio API — no external files needed

let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(frequency, duration, type = 'sine', volume = 0.3) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not supported — fail silently
  }
}

function playNotes(notes, baseDelay = 0.1) {
  try {
    const ctx = getCtx();
    notes.forEach(([freq, duration, delay, type, vol], i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + (delay ?? i * baseDelay);
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(vol ?? 0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch {
    // Audio not supported
  }
}

// --- Public sounds ---

export function playSuccess() {
  // Cheerful ascending arpeggio: C5 → E5 → G5 → C6
  playNotes([
    [523, 0.15, 0, 'triangle', 0.3],
    [659, 0.15, 0.08, 'triangle', 0.3],
    [784, 0.15, 0.16, 'triangle', 0.3],
    [1047, 0.25, 0.24, 'sine', 0.25],
  ]);
}

export function playCoin() {
  // Mario-style coin: two quick high notes
  playNotes([
    [988, 0.08, 0, 'square', 0.15],
    [1319, 0.3, 0.08, 'square', 0.12],
  ]);
}

export function playPop() {
  // Quick pop for UI interactions
  playTone(880, 0.08, 'sine', 0.2);
}

export function playStep() {
  // Soft click for step navigation
  playTone(660, 0.06, 'triangle', 0.15);
}

export function playBadge() {
  // Fanfare for badge earned: ascending melody
  playNotes([
    [523, 0.12, 0, 'triangle', 0.25],
    [659, 0.12, 0.12, 'triangle', 0.25],
    [784, 0.12, 0.24, 'triangle', 0.25],
    [1047, 0.12, 0.36, 'triangle', 0.3],
    [1319, 0.4, 0.48, 'sine', 0.2],
  ]);
}

export function playLevelUp() {
  // Sweeping power-up
  playNotes([
    [440, 0.1, 0, 'sawtooth', 0.12],
    [554, 0.1, 0.08, 'sawtooth', 0.12],
    [659, 0.1, 0.16, 'sawtooth', 0.14],
    [880, 0.1, 0.24, 'sawtooth', 0.14],
    [1109, 0.4, 0.32, 'sine', 0.18],
  ]);
}

export function playDelete() {
  // Descending whoosh
  playNotes([
    [600, 0.1, 0, 'triangle', 0.2],
    [400, 0.1, 0.06, 'triangle', 0.15],
    [250, 0.15, 0.12, 'triangle', 0.1],
  ]);
}

export function playError() {
  // Low buzz
  playNotes([
    [200, 0.15, 0, 'square', 0.12],
    [180, 0.2, 0.12, 'square', 0.1],
  ]);
}
