import { UnitImpl } from './UnitImpl';
import { TerrainSearchMap } from './TerrainSearchMap';

export class RefugeeFleeAI {
    /**
     * Reverse A* Heuristic.
     * Civilian Refugee Swarms (Batch 40) don't just wander aimlessly.
     * They scan the Thermal Anomaly channel (Channel 1) to find active combat/fires,
     * and physically calculate paths directly *away* from the highest heat concentrations.
     */
    public static calculateRepulsionVector(refugee: UnitImpl, terrainMap: TerrainSearchMap) {
        if (!((refugee as any).isRefugee)) return;

        let maxHeatX = refugee.x;
        let maxHeatY = refugee.y;
        let highestHeat = 0;

        // Scan local 20-tile radius for active warzones
        const scanRadius = 20;
        for (let y = Math.max(0, Math.floor(refugee.y - scanRadius)); y < Math.min(terrainMap.height, Math.ceil(refugee.y + scanRadius)); y++) {
            for (let x = Math.max(0, Math.floor(refugee.x - scanRadius)); x < Math.min(terrainMap.width, Math.ceil(refugee.x + scanRadius)); x++) {
                
                const heat = terrainMap.getHazardVector(x, y)[1]; // Thermal / Combat fires
                if (heat > highestHeat) {
                    highestHeat = heat;
                    maxHeatX = x;
                    maxHeatY = y;
                }
            }
        }

        if (highestHeat > 0.3) {
            // Calculate vector AWAY from the heat
            const dx = refugee.x - maxHeatX;
            const dy = refugee.y - maxHeatY;
            const len = Math.hypot(dx, dy);

            if (len > 0) {
                // Move 1 tile in the exact opposite direction
                const fleeX = Math.floor(refugee.x + (dx / len) * 2);
                const fleeY = Math.floor(refugee.y + (dy / len) * 2);
                
                (refugee as any).movementQueue = [{ x: fleeX, y: fleeY }];
            }
        }
    }
}