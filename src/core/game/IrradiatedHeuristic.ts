// Patching into the existing AStar pathfinder
import { TerrainSearchMap } from './TerrainSearchMap';

export class IrradiatedHeuristic {
    /**
     * A custom cost modifier for the A* algorithm.
     * If a WGS84 tile is highly radioactive (CBRN Channel 6), the pathfinder
     * artificially inflates the traversal cost to force units to route *around* the crater.
     */
    public static getCostWithRadiation(x: number, y: number, terrainMap: TerrainSearchMap, baseCost: number): number {
        // Base cost from terrain (e.g. Road = 20, Mountain = 200)
        let actualCost = baseCost;

        // Fetch radiation levels
        const radiationLevel = terrainMap.getHazardVector(x, y)[6]; // Channel 6: CBRN

        if (radiationLevel > 0.1) {
            // 0.1 to 1.0. 
            // A highly radioactive crater (1.0) adds +500 to the A* cost, making it functionally impassable
            // unless the player explicitly shift-clicks a forced move command.
            actualCost += (radiationLevel * 500);
        }

        return actualCost;
    }
}