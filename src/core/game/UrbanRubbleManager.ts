import { City } from './PlayerImpl';
import { TerrainSearchMap } from './TerrainSearchMap';
import { UnitImpl } from './UnitImpl';

export class UrbanRubbleManager {
    /**
     * When a city is destroyed (HP hits 0 or via Scorched Earth), it becomes Rubble.
     * Rubble heavily penalizes vehicle movement but grants massive defensive bonuses to Infantry.
     */
    public static processCityDestruction(city: City, terrainMap: TerrainSearchMap) {
        if ((city as any).isDestroyed) {
            const index = city.y * terrainMap.width + city.x;
            
            // Set A* cost to extremely high for vehicles (mud/rubble equivalent)
            terrainMap.setBaseCost(index, 200); 
            
            // Flag the tile as a 'Rubble' biome
            terrainMap.setBiome(city.x, city.y, 'RUBBLE');
        }
    }

    /**
     * Hooked into the combat loop. If an infantry unit is fired upon while inside a RUBBLE tile,
     * they take 50% less damage.
     */
    public static calculateCoverBonus(defender: UnitImpl, incomingDamage: number, terrainMap: TerrainSearchMap): number {
        if (defender.type === 'INFANTRY') {
            const biome = terrainMap.getBiome(Math.floor(defender.x), Math.floor(defender.y));
            
            if (biome === 'RUBBLE') {
                return incomingDamage * 0.5; // 50% damage reduction
            }
        }
        return incomingDamage;
    }
}