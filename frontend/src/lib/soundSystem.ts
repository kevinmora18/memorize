/**
 * MEMORIZE AAA - WEB AUDIO API SOUND SYSTEM SYNTHESIZER
 * Sistema de sonido procedural de baja latencia sin depender de archivos de audio externos.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private masterGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.3, this.ctx.currentTime);
    }
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  /** Volteo de carta suave */
  public playCardFlip() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /** Acorde / Nota de Acierto con escala musical ascendente según la racha (Combo Streak) */
  public playMatchSound(comboStreak: number = 1) {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    // Escala pentatónica para aciertos armónicos: C4, E4, G4, B4, C5, E5, G5, C6
    const baseFreqs = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99, 1046.50];
    const index = Math.min(Math.max(0, comboStreak - 1), baseFreqs.length - 1);
    const mainFreq = baseFreqs[index];
    const harmFreq = mainFreq * 1.5; // Quinta armónica

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(mainFreq, now);
    osc2.frequency.setValueAtTime(harmFreq, now + 0.05);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now + 0.03);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }

  /** Paso de Tríada / Conexión Progresiva (Do, Mi, Sol, Acorde) */
  public playTriadStep(step: number) {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25];
    const freq = notes[Math.min(step - 1, notes.length - 1)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = step >= 3 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.01, now + 0.35);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  /** Fallo o pérdida de racha */

  public playComboBreak() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /** Explosión de Carta Bomba */
  public playBombExplosion() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(40, now + 0.3);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.3);
  }

  /** Efecto de Congelación / Cristal */
  public playFreezeSound() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /** Efecto de Distorsión Glitch */
  public playGlitchSound() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.setValueAtTime(300, now + 0.05);
    osc.frequency.setValueAtTime(900, now + 0.1);
    osc.frequency.setValueAtTime(150, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /** Ataque de Jefe (Boss Attack) */
  public playBossAttack() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  /** Fanfarria de Victoria */
  public playVictoryFanfare() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const now = this.ctx!.currentTime + i * 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  /** Subida de Nivel / Desbloqueo */
  public playLevelUp() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /** Efecto de Power-Up */
  public playPowerUp() {
    this.playLevelUp();
  }

  /** Alias para explosión de bomba */
  public playBombExplode() {
    this.playBombExplosion();
  }
}

export const soundSystem = new SoundSystem();
