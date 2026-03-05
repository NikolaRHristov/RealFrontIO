export class DefconManager {
    public static currentDefcon: number = 5;
    
    // A sliding scalar from 0.0 (Peace) to 1.0 (Armageddon)
    public static globalTension: number = 0.0; 

    /**
     * Analyzes global data to calculate the DEFCON level.
     * DEFCON 1 unlocks ICBMs and strategic bombers.
     * DEFCON 5 restricts players to infantry and light armor.
     */
    public static evaluateGlobalTension(
        totalUnitsKilled: number, 
        acledUnrestSum: number, 
        nuclearLaunches: number
    ) {
        // Base tension derived from real-world ACLED data (Channel 10)
        let newTension = acledUnrestSum * 0.01;
        
        // In-game casualties increase tension
        newTension += (totalUnitsKilled * 0.001);
        
        // Nuclear launches instantly spike tension to max
        newTension += (nuclearLaunches * 0.5);

        // Clamp between 0 and 1
        this.globalTension = Math.max(0.0, Math.min(1.0, newTension));

        // Map scalar to DEFCON level (1 to 5, inverted so 1 is max tension)
        if (this.globalTension >= 0.9) this.setDefcon(1);
        else if (this.globalTension >= 0.7) this.setDefcon(2);
        else if (this.globalTension >= 0.5) this.setDefcon(3);
        else if (this.globalTension >= 0.3) this.setDefcon(4);
        else this.setDefcon(5);
    }

    private static setDefcon(level: number) {
        if (this.currentDefcon !== level) {
            this.currentDefcon = level;
            // Push to Global Ticker UI
            // EventTicker.pushEvent("STRATCOM", `GLOBAL TENSION ELEVATED. DEFCON LEVEL SHIFTED TO ${level}.`);
        }
    }
}