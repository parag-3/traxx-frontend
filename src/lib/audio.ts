/**
 * Web Audio API based synthesized alarm sound and chimes.
 * Plays high quality audible feedback on timer completion across all modern browsers.
 */

export function playTimerAlarmSound() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Harmonic chime chords repeated in an energizing sequence
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Major Chord)
    const startTime = ctx.currentTime;

    const playChord = (offset: number) => {
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, offset);

        // Attack & smooth decay envelope
        gain.gain.setValueAtTime(0.001, offset);
        gain.gain.exponentialRampToValueAtTime(0.25 / (idx + 1), offset + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, offset + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(offset);
        osc.stop(offset + 0.75);
      });
    };

    // Play 3 melodic pulses
    playChord(startTime);
    playChord(startTime + 0.35);
    playChord(startTime + 0.7);
    playChord(startTime + 1.2);
  } catch (err) {
    console.warn("Could not play synthesized alarm sound:", err);
  }
}
