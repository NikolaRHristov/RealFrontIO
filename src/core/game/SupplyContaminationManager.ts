import { PlayerImpl } from './PlayerImpl';
import { UnitImpl } from './UnitImpl';
import { TerrainSearchMap } from './TerrainSearchMap';

export class SupplyContaminationManager {
    /**
     * Interlocks with Biological / WHO data (Channel 14).
     * If a city is inside a contaminated WGS84 tile, any unit that draws logistics
     * (fuel/ammo) from that city gets infected, spreading the debuff up the A* supply line.
     */
    public static poisonLogisticsWeb(players: PlayerImpl[], units: UnitImpl[], terrainMap: TerrainSearchMap) {
        
        // Step 1: Identify poisoned cities
        const poisonedCities = new Set<string>();
        for (const player of players) {
            for (const city of player.cities) {
                const bioHazard = terrainMap.getHazardVector(city.x, city.y)[14];
                if (bioHazard > 0.3) {
                    poisonedCities.add(city.id);
                }
            }
        }

        // Step 2: Corrupt units drawing supply
        for (const unit of units) {
            if (unit.isOnFriendlySupplyLine && (unit as any).suppliedByCityId) {
                if (poisonedCities.has((unit as any).suppliedByCityId)) {
                    // Dysentery / Sickness applied via logistics!
                    (unit as any).isInfected = true;
                    unit.morale -= 0.5; // Morale collapses when troops are sick
                }
            }
        }
    }
}