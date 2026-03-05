import { TerrainSearchMap } from './TerrainSearchMap';
import { UnitImpl, UnitType } from './UnitImpl';

export class ClimateManager {
    /**
     * Called when generating the A* pathfinding graph.
     * Severe rain creates mud, slowing down tanks.
     * Severe cold freezes infantry, but tanks are relatively unaffected.
     */
    public static modifyTerrainCost(
        baseCost: number, 
        x: number, 
        y: number, 
        unitType: string, 
        terrainMap: TerrainSearchMap
    ): number {
        const vector = terrainMap.getHazardVector(x, y);
        
        // Channel 12: Precipitation (Rain/Snow volume)
        // Channel 13: Extreme Cold 
        const precipitation = vector[12];
        const extremeCold = vector[13];

        let finalCost = baseCost;

        // 1. The Mud Season (Rasputitsa) Logic
        if (precipitation > 0.3 && extremeCold === 0.0) {
            // Heavy rain on dirt/plains turns to thick mud.
            // Tanks (ARMOR) get severely bogged down.
            if (unitType === 'ARMOR') {
                finalCost += (precipitation * 50); // Massive movement penalty
            } else if (unitType === 'INFANTRY') {
                finalCost += (precipitation * 10); // Annoying, but infantry can walk through it
            }
        }

        // 2. The Blizzard / Deep Freeze Logic
        if (precipitation > 0.3 && extremeCold > 0.5) {
            // Heavy precipitation + Sub-zero temps = Deep Snow
            // Infantry are paralyzed by deep snow
            if (unitType === 'INFANTRY') {
                finalCost += (precipitation * extremeCold * 100); 
            }
        }

        return finalCost;
    }

    /**
     * Called during the main game tick loop.
     * Sub-zero WGS84 temperatures actively sap the HP of un-entrenched infantry.
     */
    public static applyExposureDamage(units: UnitImpl[], terrainMap: TerrainSearchMap) {
        for (const unit of units) {
            // Only Infantry suffer from the cold
            if (unit.type !== 'INFANTRY') continue;
            
            // If the unit is garrisoned in a city, they are warm.
            if (unit.garrisonedCityId) continue;

            const extremeCold = terrainMap.getHazardVector(unit.x, unit.y)[13];
            
            if (extremeCold > 0.3) {
                // The colder it gets, the faster they freeze.
                unit.hp -= (extremeCold * 2.0);
            }
        }
    }
}