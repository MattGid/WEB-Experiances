
class SoundEngine {
  private ctx: AudioContext | null = null;
  private drawOsc: OscillatorNode | null = null;
  private drawGain: GainNode | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playClick() {
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx!.currentTime + 0.12);
    
    // Softer gain peak and smoother decay
    gain.gain.setValueAtTime(0.06, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.12);
  }

  public playSwitch(on: boolean = true) {
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    // Using sine for a more melodic, softer tone than triangle
    osc.type = 'sine';
    const startFreq = on ? 350 : 450;
    const endFreq = on ? 450 : 350;
    
    osc.frequency.setValueAtTime(startFreq, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx!.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.05, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.15);
  }

  public playClear() {
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    // Changed from square to sine for a deep, soft "oomph" instead of a buzzy sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx!.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.08, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.5);
  }

  public startDraw() {
    this.init();
    if (this.drawOsc) return;
    
    this.drawOsc = this.ctx!.createOscillator();
    this.drawGain = this.ctx!.createGain();
    
    // Fix: use this.drawOsc instead of osc
    this.drawOsc.type = 'sine';
    this.drawOsc.frequency.setValueAtTime(120, this.ctx!.currentTime);
    
    // Subtle start to avoid popping
    this.drawGain.gain.setValueAtTime(0, this.ctx!.currentTime);
    this.drawGain.gain.linearRampToValueAtTime(0.02, this.ctx!.currentTime + 0.1);
    
    this.drawOsc.connect(this.drawGain);
    this.drawGain.connect(this.ctx!.destination);
    
    this.drawOsc.start();
  }

  public updateDraw(y: number) {
    if (!this.drawOsc || !this.ctx) return;
    // Softer frequency range for drawing
    const freq = 80 + (1 - y / 320) * 200;
    this.drawOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
  }

  public stopDraw() {
    if (!this.drawOsc || !this.drawGain || !this.ctx) return;
    
    const releaseTime = 0.1;
    this.drawGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.drawGain.gain.setValueAtTime(this.drawGain.gain.value, this.ctx.currentTime);
    this.drawGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + releaseTime);
    
    const osc = this.drawOsc;
    const g = this.drawGain;
    setTimeout(() => {
      try {
        osc.stop();
        osc.disconnect();
        g.disconnect();
      } catch (e) {
        // Handle cases where stop might be called multiple times
      }
    }, releaseTime * 1000);
    
    this.drawOsc = null;
    this.drawGain = null;
  }
}

export const sounds = new SoundEngine();
