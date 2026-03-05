import { TerrainSearchMap } from './TerrainSearchMap';
import { PlayerImpl, City } from './PlayerImpl';
import { GameImpl } from './GameImpl';
import { UnitImpl, UnitType } from './UnitImpl';

export class PartisanUprisingManager {
    /**
     * Interlocks with ACLED Civil Unrest (Channel 10).
     * If an occupying player holds a city in a highly volatile real-world region,
     * the server autonomously spawns hostile, un-flagged partisan infantry.
     */
    public static checkUnrest(game: GameImpl, terrainMap: TerrainSearchMap) {
        const players = game.getPlayers();

        for (const player of players) {
            for (const city of player.cities) {
                
                const acledSeverity = terrainMap.getHazardVector(city.x, city.y)[10];

                // If massive real-world riots are happening
                if (acledSeverity > 0.8) {
                    
                    // 5% chance per tick to spawn an uprising in this city
                    if (Math.random() < 0.05) {
                        console.warn(`[ACLED] Partisan Uprising detected in city ${city.id}!`);

                        // Spawn hostile, neutral "Partisan" infantry
                        const partisan = new UnitImpl(
                            `PARTISAN_${Date.now()}`,
                            "NEUTRAL_HOSTILE", // They belong to the environment, not a player
                            "INFANTRY",
                            city.x + (Math.random() > 0.5 ? 1 : -1),
                            city.y + (Math.random() > 0.5 ? 1 : -1)
                        );
                        
                        // Partisans specifically target factories/logistics, not combat units
                        (partisan as any).aiDirective = 'SABOTAGE_INFRASTRUCTURE';
                        
                        game.addUnit(partisan);
                    }
                }
            }
        }
    }
}