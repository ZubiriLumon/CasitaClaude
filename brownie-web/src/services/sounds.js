// Sound effects using Web Audio API (no external files needed)
const AudioCtx = window.AudioContext || window.webkitAudioContext

function playTone(frequency, duration, type = 'sine', volume = 0.3) {
  try {
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = frequency
    gain.gain.value = volume
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {
    // Silent fail if audio not available
  }
}

export function playCashSound() {
  // Ka-ching! Two quick ascending tones
  playTone(800, 0.1, 'sine', 0.25)
  setTimeout(() => playTone(1200, 0.15, 'sine', 0.3), 80)
  setTimeout(() => playTone(1600, 0.2, 'sine', 0.2), 160)
}

export function playAddSound() {
  // Quick pop
  playTone(600, 0.08, 'sine', 0.2)
}

export function playRemoveSound() {
  // Low thud
  playTone(300, 0.1, 'triangle', 0.15)
}

export function playRestockSound() {
  // Rising chime
  playTone(500, 0.1, 'sine', 0.2)
  setTimeout(() => playTone(700, 0.1, 'sine', 0.2), 100)
  setTimeout(() => playTone(900, 0.15, 'sine', 0.25), 200)
}

export function playExpenseSound() {
  // Subtle click
  playTone(400, 0.08, 'square', 0.1)
}

export function playOrderSound() {
  // Notification chime
  playTone(700, 0.12, 'sine', 0.2)
  setTimeout(() => playTone(880, 0.15, 'sine', 0.25), 120)
}

export function playDeleteSound() {
  // Descending whomp
  playTone(500, 0.1, 'sawtooth', 0.1)
  setTimeout(() => playTone(300, 0.15, 'sawtooth', 0.08), 80)
}

export function playSuccessSound() {
  // Happy ascending arpeggio
  playTone(523, 0.12, 'sine', 0.2)
  setTimeout(() => playTone(659, 0.12, 'sine', 0.2), 100)
  setTimeout(() => playTone(784, 0.12, 'sine', 0.2), 200)
  setTimeout(() => playTone(1047, 0.2, 'sine', 0.25), 300)
}
