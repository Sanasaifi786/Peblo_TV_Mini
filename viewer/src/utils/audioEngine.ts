/**
 * Peblo Bedtime Web Audio Ambient Soundscape Generator
 * Produces ultra-soothing pink noise night wind and gentle celesta chimes
 */
class BedtimeSoundscape {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private gainNode: GainNode | null = null;
  private timerId: any = null;

  public startNightWind() {
    if (this.isPlaying) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      // Buffer of pink-ish noise for gentle night wind
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.04;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Lowpass filter for muffled wind sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 320;

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.2, this.ctx.currentTime + 2);

      noiseSource.connect(filter);
      filter.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);
      noiseSource.start();

      // Occasional gentle star chime
      this.scheduleGentleChimes();
      this.isPlaying = true;
    } catch (e) {
      console.warn('AudioContext not allowed without interaction yet', e);
    }
  }

  private scheduleGentleChimes() {
    if (!this.ctx || !this.isPlaying) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    const note = notes[Math.floor(Math.random() * notes.length)];
    
    try {
      const osc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, this.ctx.currentTime);

      chimeGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.04, this.ctx.currentTime + 0.1);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.0);

      osc.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 3.2);
    } catch (e) {}

    const nextTime = 4000 + Math.random() * 5000;
    this.timerId = setTimeout(() => this.scheduleGentleChimes(), nextTime);
  }

  public stop() {
    if (this.timerId) clearTimeout(this.timerId);
    if (this.gainNode && this.ctx) {
      try {
        this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);
        setTimeout(() => {
          this.ctx?.close();
          this.ctx = null;
        }, 1000);
      } catch (e) {
        this.ctx?.close();
        this.ctx = null;
      }
    }
    this.isPlaying = false;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.startNightWind();
      return true;
    }
  }

  public active(): boolean {
    return this.isPlaying;
  }
}

export const bedtimeSoundscape = new BedtimeSoundscape();
