import { PlayerImpl, City } from './PlayerImpl';
import { TerrainSearchMap } from './TerrainSearchMap';

export class MacroEconomicsManager {
    /**
     * Tied to the Economic/Polymarket Data (Channel 9).
     * Simulates Global Interest Rates and Supply Chain friction.
     */
    public static calculateConstructionCost(baseCost: number, city: City, terrainMap: TerrainSearchMap): number {
        // Channel 9 represents economic volatility, inflation, and interest rates.
        const economicFriction = terrainMap.getHazardVector(city.x, city.y)[9];

        // If the global or local economy is crashing (e.g., inflation spike),
        // the cost of building new tanks or factories skyrockets.
        const multiplier = 1.0 + (economicFriction * 1.5); 

        return Math.floor(baseCost * multiplier);
    }

    public static processYields(players: PlayerImpl[], terrainMap: TerrainSearchMap) {
        for (const player of players) {
            let totalIncome = 0;
            for (const city of player.cities) {
                const localEconomyHealth = 1.0 - terrainMap.getHazardVector(city.x, city.y)[9];
                totalIncome += city.baseIncome * Math.max(0.1, localEconomyHealth);
            }
            player.money += totalIncome;
        }
    }
}