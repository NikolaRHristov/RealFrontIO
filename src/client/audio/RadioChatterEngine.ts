export class RadioChatterEngine {
    private static synth: SpeechSynthesis;
    private static isSupported: boolean = false;

    public static initialize() {
        if ('speechSynthesis' in window) {
            this.synth = window.speechSynthesis;
            this.isSupported = true;
        }
    }

    /**
     * Hooked into the GlobalEventTicker (Batch 27).
     * When a WGS84 OSINT event is pushed to the marquee, this reads it aloud
     * using the browser's TTS, dropping the pitch/rate to sound like a military radio.
     */
    public static broadcast(message: string) {
        if (!this.isSupported || !this.synth) return;

        // Prevent overlapping chatter by cancelling the current queue
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(message);
        
        // Find a harsh, robotic-sounding voice if available
        const voices = this.synth.getVoices();
        const roboticVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Microsoft') && v.lang === 'en-US');
        if (roboticVoice) utterance.voice = roboticVoice;

        utterance.pitch = 0.6; // Deep and gritty
        utterance.rate = 1.2;  // Fast, urgent military cadence
        utterance.volume = 0.5;

        this.synth.speak(utterance);
    }
}