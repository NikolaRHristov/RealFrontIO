import { TerrainSearchMap } from './TerrainSearchMap';
import { GameImpl } from './GameImpl';

export class SeismicManager {
    /**
     * Translates a massive WGS84 earthquake into permanent topological destruction.
     * Unlike fires which burn forests, earthquakes destroy human infrastructure
     * and permanently fracture the terrain mesh.
     */
    public static resolveTectonicDeformation(
        centerX: number, 
        centerY: number, 
        severity: number, 
        radius: number,
        terrainMap: TerrainSearchMap,
        gameMap: any
    ) {
        console.warn(`[SEISMIC ALERT] Magnitude ${severity * 10} equivalent earthquake detected at ${centerX},${centerY}`);

        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= radius) {
                    const nx = Math.floor(centerX + dx);
                    const ny = Math.floor(centerY + dy);
                    
                    if (nx >= 0 && nx < terrainMap.width && ny >= 0 && ny < terrainMap.height) {
                        const falloff = 1.0 - (distance / radius);
                        const destructionPower = severity * falloff;

                        // 1. Destroy Infrastructure (Roads, Rails, Bridges)
                        const tile = gameMap.getTile(nx, ny);
                        if (tile && tile.hasRoad && destructionPower > 0.4) {
                            tile.hasRoad = false; // Road severed
                        }
                        if (tile && tile.hasRail && destructionPower > 0.6) {
                            tile.hasRail = false; // Train logistics severed
                        }

                        // 2. Permanently deform the A* base traversal cost
                        // The terrain becomes a jagged "Fault Line" making it incredibly
                        // slow for armor/tanks to traverse.
                        if (destructionPower > 0.5) {
                            const index = ny * terrainMap.width + nx;
                            const currentCost = terrainMap.getBaseCost(index);
                            
                            // Increase pathfinding cost by 3x (simulating rubble/fissures)
                            // 255 is impassable (deep water), cap at 200 so infantry can still slowly climb it.
                            terrainMap.setBaseCost(index, Math.min(200, currentCost * 3));
                        }
                    }
                }
            }
        }
    }
}