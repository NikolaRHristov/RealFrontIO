import { AudioManager } from './AudioManager';

export class VoiceJammingManager {
    private static noiseNode: AudioBufferSourceNode | null = null;
    private static gainNode: GainNode | null = null;

    /**
     * Interacts with Channel 2 (Cyber/BGP).
     * If the HQ is under severe cyber attack, it doesn't just glitch the minimap.
     * It physically injects white noise into the browser's audio context, 
     * drowning out VoIP communication between the General and the Field Officers.
     */
    public static applyJamming(severity: number) {
        const audioCtx = (AudioManager as any).context;
        if (!audioCtx) return;

        if (severity <= 0.2) {
            if (this.gainNode) this.gainNode.gain.value = 0;
            return;
        }

        if (!this.noiseNode) {
            // Generate 2 seconds of pure white noise
            const bufferSize = audioCtx.sampleRate * 2; 
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            this.noiseNode = audioCtx.createBufferSource();
            this.noiseNode.buffer = buffer;
            this.noiseNode.loop = true;

            this.gainNode = audioCtx.createGain();
            this.gainNode.gain.value = 0;

            // Apply a severe bandpass filter to sound like broken radio static
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1000;
            filter.Q.value = 10; // Sharp screech

            this.noiseNode.connect(filter);
            filter.connect(this.gainNode);
            this.gainNode.connect(audioCtx.destination);

            this.noiseNode.start();
        }

        // Ramp the volume of the static up based on the cyber attack severity
        this.gainNode!.gain.setTargetAtTime(severity * 0.8, audioCtx.currentTime + 0.1);
    }
}