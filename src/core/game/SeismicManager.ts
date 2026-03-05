import { TerrainSearchMap } from './TerrainSearchMap';
import { GameImpl } from './GameImpl';
import { TsunamiManager } from './TsunamiManager';

export class SeismicManager {
    /**
     * Translates a massive WGS84 earthquake into permanent topological destruction.
     */
    public static resolveTectonicDeformation(
        centerX: number, 
        centerY: number, 
        severity: number, 
        radius: number,
        terrainMap: TerrainSearchMap,
        gameMap: any,
        game: GameImpl
    ) {
        console.warn(`[SEISMIC ALERT] Magnitude ${severity * 10} equivalent earthquake detected at ${centerX},${centerY}`);

        // 1. Tsunami Check (If epicenter is deep water, trigger kinetic wave instead of just ground deformation)
        TsunamiManager.propagateTsunami(centerX, centerY, severity, terrainMap, gameMap, game.getUnits());

        // 2. Ground Deformation
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= radius) {
                    const nx = Math.floor(centerX + dx);
                    const ny = Math.floor(centerY + dy);
                    
                    if (nx >= 0 && nx < terrainMap.width && ny >= 0 && ny < terrainMap.height) {
                        const falloff = 1.0 - (distance / radius);
                        const destructionPower = severity * falloff;

                        // Destroy Infrastructure
                        const tile = gameMap.getTile(nx, ny);
                        if (tile && tile.hasRoad && destructionPower > 0.4) tile.hasRoad = false;
                        if (tile && tile.hasRail && destructionPower > 0.6) tile.hasRail = false;

                        // Permanently deform the A* base traversal cost
                        if (destructionPower > 0.5) {
                            const index = ny * terrainMap.width + nx;
                            const currentCost = terrainMap.getBaseCost(index);
                            terrainMap.setBaseCost(index, Math.min(200, currentCost * 3));
                        }
                    }
                }
            }
        }
    }
}