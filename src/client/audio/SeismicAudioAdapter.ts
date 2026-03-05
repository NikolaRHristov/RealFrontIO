import { AudioManager } from '../../client/audio/AudioManager';

export class SeismicAudioAdapter {
    /**
     * Hooked into the SeismicManager.
     * When a WGS84 magnitude 8.0+ earthquake strikes, it violently warps
     * the master audio bus, dropping the pitch and creating a terrifying rumble.
     */
    public static triggerEarthquakeRumble(magnitude: number) {
        const audioCtx = (AudioManager as any).context;
        if (!audioCtx) return;

        // Create a low-frequency oscillator for the physical "rumble"
        const rumble = audioCtx.createOscillator();
        rumble.type = 'sawtooth';
        rumble.frequency.value = 40; // Deep sub-bass

        // Route it through a distortion curve
        const distortion = audioCtx.createWaveShaper();
        distortion.curve = this.makeDistortionCurve(400); // Heavy clipping

        // Pitch shift effect: We simulate the "slowing down" of time/audio
        // by attaching a detune node to the master mix (if available) or just playing the drone
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(magnitude, audioCtx.currentTime + 1.0); // Swell up
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + (magnitude * 5.0)); // Fade out over time

        rumble.connect(distortion);
        distortion.connect(gainNode);
        gainNode.connect((AudioManager as any).gainNode);

        rumble.start();
        rumble.stop(audioCtx.currentTime + (magnitude * 5.0));
    }

    private static makeDistortionCurve(amount: number) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }
}