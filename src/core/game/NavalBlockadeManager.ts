import { UnitImpl } from './UnitImpl';
import { City, PlayerImpl } from './PlayerImpl';

export class NavalBlockadeManager {
    /**
     * If a player surrounds an enemy coastal city with warships,
     * they establish a Naval Blockade. This severs the city's ability to generate income
     * and cuts it off from the Strategic Airlift web (Batch 62).
     */
    public static evaluateBlockades(cities: City[], warships: UnitImpl[], players: Map<string, PlayerImpl>) {
        for (const city of cities) {
            // Only evaluate coastal cities
            if (!(city as any).isCoastal) continue;

            let hostileShipsNearby = 0;
            const blockadeRadius = 10;

            for (const ship of warships) {
                if (ship.ownerId !== city.ownerId && ship.type === 'DESTROYER') {
                    const dist = Math.hypot(ship.x - city.x, ship.y - city.y);
                    if (dist <= blockadeRadius) {
                        hostileShipsNearby++;
                    }
                }
            }

            // If 3 or more enemy warships are holding the coast, the port is blockaded
            if (hostileShipsNearby >= 3) {
                if (!(city as any).isBlockaded) {
                    (city as any).isBlockaded = true;
                    console.warn(`[NAVAL] City ${city.id} has been BLOCKADED! Income halted.`);
                }
                // Zero out the income for the tick
                city.baseIncome = 0;
            } else {
                (city as any).isBlockaded = false;
            }
        }
    }
}