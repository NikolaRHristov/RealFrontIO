import { TerrainSearchMap } from './TerrainSearchMap';

export class RasputitsaManager {
    /**
     * Interlocks with Global Precipitation (Channel 13) and Soil Moisture (Channel 12).
     * "General Winter" / Mud Season.
     * When rain is maxed out, dirt roads turn into impassable mud, trapping heavy armor.
     */
    public static calculateMudFriction(x: number, y: number, terrainMap: TerrainSearchMap, baseCost: number): number {
        // Only affect unpaved terrain (e.g., dirt, plains, forests)
        if (baseCost < 50 || baseCost >= 200) return baseCost;

        const vector = terrainMap.getHazardVector(x, y);
        const soilMoisture = vector[12];
        const precipitation = vector[13];

        const mudSeverity = (soilMoisture * 0.6) + (precipitation * 0.4);

        if (mudSeverity > 0.7) {
            // Severe Rasputitsa: The A* cost quadruples, acting like glue.
            // Tanks moving through this will burn immense amounts of fuel per tick.
            return baseCost * 4;
        } else if (mudSeverity > 0.4) {
            // Light mud
            return baseCost * 2;
        }

        return baseCost;
    }
}