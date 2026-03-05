import { TerrainSearchMap } from './TerrainSearchMap';
import { UnitImpl, UnitType } from './UnitImpl';
import { PlayerImpl } from './PlayerImpl';

export class CyberSpoofingManager {
    /**
     * Interlocks with NetBlocks / BGP Hijacking data (Channel 2).
     * If a region is under a severe cyber attack, it doesn't just jam radar—
     * it actively injects "Ghost" units onto the enemy minimap.
     */
    public static generateRadarEchoes(units: UnitImpl[], terrainMap: TerrainSearchMap, ghostBuffer: UnitImpl[]) {
        // Clear previous ghosts
        ghostBuffer.length = 0;

        for (const unit of units) {
            // Only high-tech units are targeted for spoofing
            if (unit.type === 'INFANTRY') continue;

            const cyberSeverity = terrainMap.getHazardVector(unit.x, unit.y)[2];
            
            // Severe BGP route leak / Cyber Attack
            if (cyberSeverity > 0.6) {
                // Generate 1-3 fake "echoes" of this unit within a 10-tile radius
                const echoCount = Math.floor(cyberSeverity * 3) + 1;
                
                for (let i = 0; i < echoCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * 10;
                    
                    const ghost = new UnitImpl(
                        `GHOST_${unit.id}_${i}`,
                        unit.ownerId,
                        unit.type,
                        Math.floor(unit.x + Math.cos(angle) * distance),
                        Math.floor(unit.y + Math.sin(angle) * distance)
                    );
                    
                    // Tag it so the server knows not to run combat logic on it, 
                    // but the client will render it as a real unit on the minimap.
                    (ghost as any).isRadarGhost = true; 
                    ghostBuffer.push(ghost);
                }
            }
        }
    }
}