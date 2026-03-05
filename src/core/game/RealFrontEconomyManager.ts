import { TerrainSearchMap } from './TerrainSearchMap';

export class RealFrontEconomyManager {
    /**
     * Replaces standard cost calculations in NationCreation or Factory production.
     */
    public static calculateProductionCost(
        baseCost: number, 
        x: number, 
        y: number, 
        terrainMap: TerrainSearchMap
    ): number {
        const hazardVector = terrainMap.getHazardVector(x, y);
        const economicSanction = hazardVector[2]; // GDELT Economic Sanctions
        const civilUnrest = hazardVector[3];      // ACLED / WorldMonitor Protests

        let multiplier = 1.0;

        // Severe economic sanctions skyrocket local production costs (hyperinflation)
        if (economicSanction > 0.0) {
            multiplier += (economicSanction * 2.0); // Up to 300% cost
        }

        // Riots and protests penalize logistics and supply chain efficiency
        if (civilUnrest > 0.4) {
            multiplier += 0.5; // Flat 50% penalty
        }

        return Math.floor(baseCost * multiplier);
    }

    /**
     * Applies modifiers to passive city income ticks.
     */
    public static calculateResourceTick(
        baseIncome: number, 
        x: number, 
        y: number, 
        terrainMap: TerrainSearchMap
    ): number {
        const civilUnrest = terrainMap.getHazardVector(x, y)[3];
        
        if (civilUnrest > 0.5) {
            return 0; // Mass riots halt all city income completely
        }
        
        return baseIncome;
    }
}