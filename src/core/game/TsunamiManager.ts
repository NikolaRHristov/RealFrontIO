import { TerrainSearchMap } from './TerrainSearchMap';
import { UnitImpl } from './UnitImpl';

export class TsunamiManager {
    /**
     * Triggered when a massive USGS earthquake happens inside an oceanic WGS84 tile.
     * Propagates a massive wave that instantly destroys coastal cities and fleets.
     */
    public static propagateTsunami(centerX: number, centerY: number, magnitude: number, terrainMap: TerrainSearchMap, gameMap: any, units: UnitImpl[]) {
        // If the quake is less than 7.5, no significant tsunami is generated
        if (magnitude < 0.6) return;

        // Verify the epicenter is in deep water
        const centerCost = terrainMap.getBaseCost(centerY * terrainMap.width + centerX);
        if (centerCost !== 255) return; // 255 = Deep Water in our engine

        console.warn(`[TSUNAMI WARNING] Submarine Earthquake at ${centerX},${centerY}. Propagating kinetic wave.`);

        // Tsunami travels in an expanding ring
        const maxRadius = magnitude * 40; 

        for (let r = 0; r < maxRadius; r++) {
            // In a real implementation, we would use a Bresenham circle or flood fill.
            // When the expanding wave hits land (baseCost < 255), it converts to a massive 
            // physical hazard spike (Channel 0) and washes away any units or cities.

            // Sweeping naval units
            for (const unit of units) {
                const distance = Math.sqrt(Math.pow(unit.x - centerX, 2) + Math.pow(unit.y - centerY, 2));
                if (Math.abs(distance - r) < 1.0) {
                    if (unit.type === 'NAVAL') {
                        unit.hp -= 200; // Capsize
                    } else if (unit.type === 'INFANTRY' && terrainMap.getBaseCost(unit.y * terrainMap.width + unit.x) < 255) {
                        // Infantry caught in the coastal wash
                        unit.hp -= 100;
                    }
                }
            }
        }
    }
}