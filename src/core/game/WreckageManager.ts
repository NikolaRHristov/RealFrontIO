import { TerrainSearchMap } from './TerrainSearchMap';

export class WreckageManager {
    /**
     * The "Highway of Death" mechanic.
     * When heavy armored units are destroyed, they leave behind permanent burning wreckage.
     * If this happens on a road tile, it severely bottlenecks logistics and pathfinding.
     */
    public static registerUnitDeath(x: number, y: number, isHeavyArmor: boolean, terrainMap: TerrainSearchMap) {
        if (!isHeavyArmor) return;

        const index = y * terrainMap.width + x;
        const currentCost = terrainMap.getBaseCost(index);

        // If it's a road (cost ~20) or clear terrain (cost ~50)
        // Wreckage acts as a physical barricade, skyrocketing the A* traversal cost.
        if (currentCost < 150) {
            const newCost = Math.min(250, currentCost + 80); // Wreckage slows movement to a crawl
            terrainMap.setBaseCost(index, newCost);

            // Notify renderer to draw blackened tank hulls / smoke plumes
            // EventTicker.pushEvent("WRECKAGE_CREATED", `Grid [${x},${y}] blocked by destroyed armor.`);
        }
    }
}