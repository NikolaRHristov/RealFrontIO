import { TerrainSearchMap } from './TerrainSearchMap';
import { UnitImpl, UnitType } from './UnitImpl';
import { GameImpl } from './GameImpl';

export class RogueArtilleryAI {
    /**
     * Hooks into the ACLED Combat Zone channel (Channel 10).
     * If real-world protests/armed clashes spike violently in a specific sector,
     * it spawns uncontrollable Hostile Neutral artillery batteries that shell everything.
     */
    public static processAcledEscalation(terrainMap: TerrainSearchMap, game: GameImpl) {
        const gridArea = terrainMap.width * terrainMap.height;
        
        for (let i = 0; i < gridArea; i++) {
            const x = i % terrainMap.width;
            const y = Math.floor(i / terrainMap.width);
            
            const acledViolence = terrainMap.getHazardVector(x, y)[10]; // Channel 10
            
            // Severe real-world violence threshold
            if (acledViolence > 0.9) {
                // 1% chance per tick to spawn a rogue battery in this violent tile
                if (Math.random() < 0.01) {
                    this.spawnRogueBattery(x, y, game);
                }
            }
        }
    }

    private static spawnRogueBattery(x: number, y: number, game: GameImpl) {
        console.warn(`[ACLED] Extreme violence detected at ${x},${y}. Spawning Rogue Artillery.`);
        
        const rogueUnit = new UnitImpl(
            `ROGUE_ARTY_${Date.now()}`,
            "NEUTRAL_HOSTILE_FACTION", // Belongs to no player
            UnitType.ARTILLERY,
            x, y
        );
        
        // Rogue units have massive HP because they represent entrenched paramilitaries
        rogueUnit.maxHp = 500;
        rogueUnit.hp = 500;
        
        // The AI simply finds the nearest player city and begins blindly firing cruise missiles at it
        const target = this.findNearestPlayerCity(x, y, game);
        if (target) {
            rogueUnit.currentCommand = {
                type: 'ATTACK',
                targetX: target.x,
                targetY: target.y
            };
        }

        game.addUnit(rogueUnit);
    }

    private static findNearestPlayerCity(x: number, y: number, game: GameImpl) {
        let closestCity = null;
        let minDistance = Infinity;

        for (const player of game.getPlayers()) {
            for (const city of player.cities) {
                const dist = Math.sqrt(Math.pow(city.x - x, 2) + Math.pow(city.y - y, 2));
                if (dist < minDistance) {
                    minDistance = dist;
                    closestCity = city;
                }
            }
        }
        return closestCity;
    }
}