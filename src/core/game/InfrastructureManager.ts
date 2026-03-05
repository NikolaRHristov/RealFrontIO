import { TerrainSearchMap } from './TerrainSearchMap';

export class InfrastructureManager {
    /**
     * Handles the destruction of bridges over water tiles.
     * If a bridge is destroyed by a GDACS Flood, players must deploy Engineers to build Pontoons.
     */
    public static processBridgePhysics(x: number, y: number, terrainMap: TerrainSearchMap, isBuildingPontoon: boolean) {
        const index = y * terrainMap.width + x;
        const currentCost = terrainMap.getBaseCost(index);

        // 255 = Deep Water, 200 = Shallow Water
        const isWater = currentCost >= 200;

        if (isWater && isBuildingPontoon) {
            // Engineers deploy a pontoon. Temporarily lowers the A* cost from 255 (Impassable)
            // to 50 (Slow dirt road) so tanks can cross.
            terrainMap.setBaseCost(index, 50);
            
            // Note: Pontoons are highly vulnerable. The next GDACS flood wave will 
            // instantly reset this tile back to 255.
        }
    }
}