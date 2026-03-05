import { City, PlayerImpl } from './PlayerImpl';
import { TerrainSearchMap } from './TerrainSearchMap';

export class ScorchedEarthProtocol {
    /**
     * A retreating player can click the "Scorched Earth" UI button.
     * This physically destroys their own city, permanently removing it from the economy,
     * and sets the tile on fire (Channel 1 Thermal spike) to damage the advancing enemy.
     */
    public static executeScorchedEarth(cityId: string, player: PlayerImpl, terrainMap: TerrainSearchMap) {
        const cityIndex = player.cities.findIndex(c => c.id === cityId);
        if (cityIndex === -1) return; // City not owned by player

        const city = player.cities[cityIndex];

        // 1. Destroy the economy
        (city as any).isDestroyed = true;
        city.baseIncome = 0;

        // 2. Set the terrain on fire (Inject massive heat into Channel 1)
        terrainMap.setHazardChannel(city.x, city.y, 1, 1.0); // 1.0 = Max Thermal (White Hot FLIR)
        
        // This extreme heat will trigger the AqiManager (Batch 51) to apply respiratory 
        // damage to the enemy infantry when they try to occupy the ruins.

        console.warn(`[SCORCHED EARTH] Player ${player.id} detonated city ${city.id} to deny it to the enemy.`);
    }
}