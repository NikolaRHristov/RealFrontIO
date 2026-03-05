import { UnitImpl } from './UnitImpl';
import { TerrainSearchMap } from './TerrainSearchMap';
import { PlayerImpl } from './PlayerImpl';

export class EmpManager {
    /**
     * When a nuclear device detonates, it calculates two radii:
     * 1. Kinetic/Thermal (Vaporization) - Handled by older batches
     * 2. Electromagnetic Pulse (EMP) - Massive radius that kills electronics
     */
    public static detonateEmp(centerX: number, centerY: number, radius: number, units: UnitImpl[], terrainMap: TerrainSearchMap, players: Map<string, PlayerImpl>) {
        
        // 1. Fry all units in radius
        for (const unit of units) {
            // Infantry are largely unaffected by EMPs directly, just their comms
            if (unit.type === 'INFANTRY') continue;

            const dist = Math.hypot(unit.x - centerX, unit.y - centerY);
            if (dist <= radius) {
                // Instantly zero out fuel/batteries and immobilize
                (unit as any).currentFuel = 0;
                (unit as any).isImmobilized = true;
                
                // If it's an aircraft, it physically falls out of the sky
                if (unit.type === 'AIRCRAFT' || unit.type === 'BOMBER' || unit.type === 'TRANSPORT_PLANE') {
                    unit.hp = 0; // Destroyed
                }
            }
        }

        // 2. Overload the local Cyber/BGP Channel (Channel 2) to glitch the minimap
        for (let y = Math.floor(centerY - radius); y <= Math.ceil(centerY + radius); y++) {
            for (let x = Math.floor(centerX - radius); x <= Math.ceil(centerX + radius); x++) {
                const dist = Math.hypot(x - centerX, y - centerY);
                if (dist <= radius && x >= 0 && x < terrainMap.width && y >= 0 && y < terrainMap.height) {
                    // Force the Cyber severity to 1.0 (Total Blackout)
                    terrainMap.setHazardChannel(x, y, 2, 1.0);
                }
            }
        }
    }
}