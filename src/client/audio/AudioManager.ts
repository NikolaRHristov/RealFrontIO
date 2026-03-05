export class AudioManager {
    private static context: AudioContext | null = null;
    private static gainNode: GainNode | null = null;

    private static initialize() {
        if (!this.context) {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.gainNode = this.context.createGain();
            this.gainNode.connect(this.context.destination);
            this.gainNode.gain.value = 0.5; // Master volume
        }
    }

    /**
     * Synthesizes a terrifying, brutalist siren using raw oscillators.
     * Triggered when the global DEFCON state drops.
     */
    public static playDefconSiren(level: number) {
        this.initialize();
        if (!this.context || !this.gainNode) return;

        const osc = this.context.createOscillator();
        const lfo = this.context.createOscillator();
        const sirenGain = this.context.createGain();

        // The lower the DEFCON, the more aggressive the pitch and modulation
        const baseFreq = level === 1 ? 800 : (level === 2 ? 600 : 400);
        const modFreq = level === 1 ? 4.0 : 1.0;

        osc.type = 'square';
        osc.frequency.value = baseFreq;

        // LFO controls the rising/falling wail of the siren
        lfo.type = 'sine';
        lfo.frequency.value = modFreq; 

        // Connect LFO to Oscillator Frequency
        const modGain = this.context.createGain();
        modGain.gain.value = 200; // Pitch sweep range
        lfo.connect(modGain);
        modGain.connect(osc.frequency);

        osc.connect(sirenGain);
        sirenGain.connect(this.gainNode);

        // Envelope to prevent clicking
        sirenGain.gain.setValueAtTime(0, this.context.currentTime);
        sirenGain.gain.linearRampToValueAtTime(1.0, this.context.currentTime + 1.0);
        sirenGain.gain.linearRampToValueAtTime(0, this.context.currentTime + 5.0);

        osc.start();
        lfo.start();
        osc.stop(this.context.currentTime + 5.0);
        lfo.stop(this.context.currentTime + 5.0);
    }

    /**
     * Synthesizes harsh digital static.
     * Triggered when NetBlocks severs the WGS84 submarine cables.
     */
    public static playCyberStatic(durationMs: number) {
        this.initialize();
        if (!this.context || !this.gainNode) return;

        const bufferSize = this.context.sampleRate * (durationMs / 1000);
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate pure white noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.context.createBufferSource();
        noise.buffer = buffer;

        // Run it through a severe bandpass filter to sound like a broken radio
        const filter = this.context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 10.0;

        noise.connect(filter);
        filter.connect(this.gainNode);
        
        noise.start();
    }
}