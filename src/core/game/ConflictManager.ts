import { TerrainSearchMap } from './TerrainSearchMap';
import { GameImpl } from './GameImpl';
import { UnitImpl, UnitType } from './UnitImpl';

export class ConflictManager {
    /**
     * Reads the WGS84 hazard memory block for ACLED conflict spikes.
     * If a massive real-world battle is detected, the game spawns hostile "Rogue" 
     * units at those exact coordinates to harass whatever player owns that territory.
     */
    public static resolveAcledSpawns(game: GameImpl, terrainMap: TerrainSearchMap, currentTick: number): void {
        // Only evaluate rogue spawns every 1000 ticks to prevent game flooding
        if (currentTick % 1000 !== 0) return;

        // Iterate through the grid looking for severe Geopolitical Conflicts (Channel 0 / Physical)
        // In a real implementation, we'd use an R-Tree, but for the PoC we scan a sampled grid.
        for (let y = 0; y < terrainMap.height; y += 10) {
            for (let x = 0; x < terrainMap.width; x += 10) {
                const vector = terrainMap.getHazardVector(x, y);
                const warSeverity = vector[0]; 

                if (warSeverity > 0.8) {
                    // Spawn a neutral hostile rogue armor division
                    console.log(`[ACLED] Massive real-world conflict detected at ${x},${y}. Spawning Rogue AI.`);
                    this.spawnRogueUnit(game, x, y, Math.floor(warSeverity * 100));
                    
                    // Artificial decay: we consume the hazard scalar so it doesn't spawn infinite units
                    terrainMap.multiHazardVectors[(y * terrainMap.width + x) * 4] *= 0.1;
                }
            }
        }
    }

    private static spawnRogueUnit(game: GameImpl, x: number, y: number, hp: number): void {
        const rogue = new UnitImpl();
        rogue.type = UnitType.ARMOR;
        rogue.x = x;
        rogue.y = y;
        rogue.hp = hp;
        rogue.ownerId = 'NEUTRAL_HOSTILE'; // Will automatically attack nearest player
        game.addUnit(rogue);
    }
}