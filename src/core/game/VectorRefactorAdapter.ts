import { TerrainSearchMap } from './TerrainSearchMap';

export class VectorRefactorAdapter {
    // Helper class to map the legacy 4-channel indices to the new 16-channel offsets

    public static updateCombatManager(targetX: number, targetY: number, terrainMap: TerrainSearchMap) {
        const vector = terrainMap.getHazardVector(targetX, targetY);
        // OLD: vector[0] -> NEW: vector[10] (ACLED Combat Zone)
        return vector[10];
    }

    public static updateCBRNManager(targetX: number, targetY: number, terrainMap: TerrainSearchMap) {
        const vector = terrainMap.getHazardVector(targetX, targetY);
        // OLD: vector[0] -> NEW: vector[6] (Radiation)
        return vector[6];
    }

    public static updateEconomyManager(targetX: number, targetY: number, terrainMap: TerrainSearchMap) {
        const vector = terrainMap.getHazardVector(targetX, targetY);
        // OLD: vector[2] -> NEW: vector[9] (Polymarket Econ)
        // OLD: vector[3] -> NEW: vector[7] (Civil Unrest)
        return { econ: vector[9], unrest: vector[7] };
    }
}