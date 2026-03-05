import { TerrainSearchMap } from './TerrainSearchMap';
import { PlayerImpl } from './PlayerImpl';
import { UnitImpl } from './UnitImpl';

export class VisionManager {
    /**
     * Updates the Fog of War mask for a specific player.
     * Uses simple raycasting for ground units, but incorporates OpenSky Channel 11 for global sweeps.
     */
    public static calculatePlayerVision(player: PlayerImpl, allUnits: UnitImpl[], terrainMap: TerrainSearchMap, fogBuffer: Uint8Array) {
        
        // 1. Reset the player's fog mask (0 = Hidden, 1 = Explored, 2 = Visible)
        // For performance, we only demote 2 (Visible) to 1 (Explored, grayed out)
        for (let i = 0; i < fogBuffer.length; i++) {
            if (fogBuffer[i] === 2) fogBuffer[i] = 1; 
        }

        // 2. Ground Unit Raycasting (Standard RTS Vision)
        const myUnits = allUnits.filter(u => u.ownerId === player.id);
        for (const unit of myUnits) {
            const visionRadius = (unit as any).visionRange || 5;
            this.revealRadius(unit.x, unit.y, visionRadius, terrainMap.width, fogBuffer);
        }

        // 3. City & Radar Installation Vision
        for (const city of player.cities) {
            this.revealRadius(city.x, city.y, 8, terrainMap.width, fogBuffer);
        }

        // 4. THE OPENSKY AWACS OVERRIDE (Channel 11)
        // If a real-world military recon plane (AWACS / E-3 Sentry) is flying over a WGS84 tile,
        // it acts as a global radar sweep, clearing the Fog of War for everyone directly below it.
        const gridArea = terrainMap.width * terrainMap.height;
        for (let i = 0; i < gridArea; i++) {
            const x = i % terrainMap.width;
            const y = Math.floor(i / terrainMap.width);
            
            const reconSignal = terrainMap.getHazardVector(x, y)[11]; // Channel 11
            
            if (reconSignal > 0.5) {
                // Real world plane is overhead. Reveal the tile and surrounding area instantly.
                this.revealRadius(x, y, 10, terrainMap.width, fogBuffer);
            }
        }
    }

    /**
     * Helper to paint the Fog of War buffer in a circle
     */
    private static revealRadius(centerX: number, centerY: number, radius: number, gridWidth: number, fogBuffer: Uint8Array) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (dx*dx + dy*dy <= radius*radius) {
                    const nx = Math.floor(centerX + dx);
                    const ny = Math.floor(centerY + dy);
                    if (nx >= 0 && ny >= 0 && nx < gridWidth) {
                        const idx = ny * gridWidth + nx;
                        if (idx < fogBuffer.length) {
                            fogBuffer[idx] = 2; // 2 = Actively Visible
                        }
                    }
                }
            }
        }
    }
}