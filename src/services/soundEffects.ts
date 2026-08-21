/**
 * Pure Web Audio API Synthesizer for "The AI Detective"
 * High quality self-contained audio engine with zero external network audio files.
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbiencePlaying: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAmbience();
    } else {
      this.startAmbience();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public startAmbience() {
    if (this.isMuted || this.isAmbiencePlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      // Gentle noir drone (Low D minor chord with subtle filter warmth)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(73.42, ctx.currentTime); // D2

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110.0, ctx.currentTime); // A2

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 3);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      this.ambientOsc1 = osc1;
      this.ambientOsc2 = osc2;
      this.ambientGain = gain;
      this.isAmbiencePlaying = true;
    } catch (e) {
      console.warn('Ambience init suppressed:', e);
    }
  }

  public stopAmbience() {
    if (!this.isAmbiencePlaying) return;
    try {
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1);
        setTimeout(() => {
          this.ambientOsc1?.stop();
          this.ambientOsc2?.stop();
          this.ambientOsc1?.disconnect();
          this.ambientOsc2?.disconnect();
          this.isAmbiencePlaying = false;
        }, 1000);
      }
    } catch (e) {
      this.isAmbiencePlaying = false;
    }
  }

  public playClueDiscovered() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Arpeggiated mystery glass chime (C#5 -> E5 -> G#5 -> B5)
      const freqs = [554.37, 659.25, 830.61, 987.77];
      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0.001, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.12, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 1.25);
      });
    } catch (e) {}
  }

  public playContradictionAlert() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Dramatic brass / tension strike
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(164.81, now + 0.6); // E3

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(233.08, now); // Minor second dissonance
      osc2.frequency.exponentialRampToValueAtTime(174.61, now + 0.6);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.95);
      osc2.stop(now + 0.95);
    } catch (e) {}
  }

  public playTypewriterKey() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(600 + Math.random() * 200, now);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  public playWrongAccusation() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.8);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.9);
    } catch (e) {}
  }

  public playCaseSolved() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Majestic triumphant brass chords (D major -> G major -> A major -> D)
      const chords = [
        [293.66, 369.99, 440.0], // D4, F#4, A4
        [392.0, 493.88, 587.33], // G4, B4, D5
        [440.0, 554.37, 659.25], // A4, C#5, E5
        [587.33, 739.99, 880.0], // D5, F#5, A5
      ];

      chords.forEach((chord, chordIdx) => {
        const chordTime = now + chordIdx * 0.45;
        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, chordTime);

          gain.gain.setValueAtTime(0.001, chordTime);
          gain.gain.exponentialRampToValueAtTime(0.1, chordTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, chordTime + 1.2);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(chordTime);
          osc.stop(chordTime + 1.25);
        });
      });
    } catch (e) {}
  }
}

export const sounds = new SoundEffectsEngine();
