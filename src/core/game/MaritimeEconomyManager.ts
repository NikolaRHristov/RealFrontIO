import { TerrainSearchMap } from './TerrainSearchMap';
import { PlayerImpl } from './PlayerImpl';

export class MaritimeEconomyManager {
    // 1.0 = Free trade, 0.1 = Total global embargo / blockade
    public static globalTradeMultiplier: number = 1.0; 

    /**
     * Updates the global trade index based on the Rust Capsule's AIS ingestion.
     * Called every 60 seconds (game time).
     */
    public static updateGlobalTradeHealth(healthIndex: number) {
        this.globalTradeMultiplier = healthIndex;
        console.log(`[MARITIME] Global Trade Health updated to: ${(healthIndex * 100).toFixed(1)}%`);
    }

    /**
     * Recalculates player income.
     * Nations that rely on coastal cities/ports suffer massive economic penalties
     * if real-world global shipping lanes (like the Red Sea) are attacked or blocked.
     */
    public static applyTradeIncome(players: PlayerImpl[]) {
        for (const player of players) {
            let portIncome = 0;
            let landlockedIncome = 0;

            for (const city of player.cities) {
                if (city.isCoastal) {
                    // Coastal cities generate high base revenue but are highly vulnerable 
                    // to real-world maritime supply chain shocks
                    portIncome += (city.baseIncome * 2.0) * this.globalTradeMultiplier;
                } else {
                    // Landlocked cities are stable but generate less overall wealth
                    landlockedIncome += city.baseIncome;
                }
            }

            // Grant the calculated wealth to the player
            player.money += Math.floor(portIncome + landlockedIncome);
        }
    }
}