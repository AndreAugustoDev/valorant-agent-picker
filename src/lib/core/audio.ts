class SoundEffects {
  private ctx: AudioContext | null = null;
  private lastTickMs = 0;
  public isMuted = false;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  /**
   * Plays a crisp, percussive click with spacing protection to prevent buzzing
   */
  playTick(speedFactor = 1) {
    if (this.isMuted) {
      return;
    }
    this.init();
    if (!this.ctx) {
      return;
    }

    const nowMs = performance.now();
    if (nowMs - this.lastTickMs < 55) {
      return;
    }
    this.lastTickMs = nowMs;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 340 + Math.min(speedFactor * 120, 220);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.018);

      const volume = Math.min(0.12 + speedFactor * 0.06, 0.2);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.018);
    } catch {
      // Audio context safe fallback
    }
  }

  /**
   * Fanfare chime chord played upon revealing the winner
   */
  playWin() {
    if (this.isMuted) {
      return;
    }
    this.init();
    if (!this.ctx) {
      return;
    }

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];

      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.14, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.4);
      });
    } catch {
      // Audio context error ignored
    }
  }
}

export const sfx = new SoundEffects();
