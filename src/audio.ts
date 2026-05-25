/**
 * Web Audio API synthesizer for barcode client sound effects
 * Plays scanner sound indicators without external asset dependencies
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Modern high-pitched scanner bip (1200Hz, 80ms)
 */
export function playSuccessBeep() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    
    // Very swift clicky volume ramp
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (e) {
    console.warn('Audio feedback failed to play', e);
  }
}

/**
 * Deep low-frequency alarm buzzer for duplicates or errors (150Hz square wave, 350ms)
 */
export function playErrorBuzzer() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, ctx.currentTime);
    
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(135, ctx.currentTime); // Beating effect

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.02);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc2.start();
    
    osc.stop(ctx.currentTime + 0.36);
    osc2.stop(ctx.currentTime + 0.36);
  } catch (e) {
    console.warn('Audio feedback failed to play', e);
  }
}

/**
 * Higher double-tone chime for warning notifications
 */
export function playWarningChime() {
  try {
    const ctx = getAudioContext();
    
    // First note
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.16);

    // Second note delayed
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.frequency.setValueAtTime(1046, ctx.currentTime);
        gain2.gain.setValueAtTime(0, ctx.currentTime);
        gain2.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.21);
      } catch {}
    }, 120);

  } catch (e) {
    console.warn('Audio feedback failed to play', e);
  }
}
