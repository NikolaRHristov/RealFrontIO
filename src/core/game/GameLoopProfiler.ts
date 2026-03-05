export class GameLoopProfiler {
    private static frameTimes: number[] = [];
    private static memorySnapshots: number[] = [];
    
    /**
     * Because the 16-Channel SharedArrayBuffer is massive, we must ensure
     * reading it 100,000 times per tick does not drop the server below 60 TPS.
     */
    public static measureTick(tickLogic: () => void) {
        const start = performance.now();
        
        // Execute the actual game mechanics
        tickLogic();
        
        const duration = performance.now() - start;
        this.frameTimes.push(duration);

        if (this.frameTimes.length > 100) this.frameTimes.shift();

        // Warning threshold: If a single tick takes more than 16ms, we are losing 60 FPS.
        if (duration > 16.0) {
            console.warn(`[PROFILER] Frame Drop Detected! Tick took ${duration.toFixed(2)}ms. Checking memory buffers...`);
        }
    }

    public static getAverageTickTime(): number {
        if (this.frameTimes.length === 0) return 0;
        const sum = this.frameTimes.reduce((a, b) => a + b, 0);
        return sum / this.frameTimes.length;
    }
}