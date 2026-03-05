import { TerrainSearchMap } from './TerrainSearchMap';
import { GameImpl } from './GameImpl';

export class KesslerSyndromeManager {
    /**
     * If the Orbital/GPS channel (Channel 3) hits maximum severity (1.0),
     * a chain reaction occurs in LEO. Satellites collide and burn up,
     * raining physical debris down onto the game map as unguided artillery.
     */
    public static processOrbitalDecay(currentTick: number, terrainMap: TerrainSearchMap, game: GameImpl) {
        // Sample random high-altitude points to check global GPS degradation
        const globalGpsDegradation = terrainMap.getHazardVector(
            Math.floor(Math.random() * terrainMap.width), 
            Math.floor(Math.random() * terrainMap.height)
        )[3];

        if (globalGpsDegradation >= 0.95) {
            // Kessler Syndrome is active. 
            // 10% chance every tick for a piece of debris to hit the map.
            if (Math.random() > 0.9) {
                const targetX = Math.floor(Math.random() * terrainMap.width);
                const targetY = Math.floor(Math.random() * terrainMap.height);

                console.warn(`[ORBITAL] Kessler Debris falling at [${targetX}, ${targetY}]`);

                // Spawn an incoming kinetic strike. (Leveraging the Nuclear strike queue from Batch 46)
                (game as any).pendingNuclearStrikes.push({ 
                    x: targetX, 
                    y: targetY, 
                    timer: 60, // Fast impact (6 seconds)
                    isDebris: true // Does kinetic damage, no radiation
                });
            }
        }
    }
}