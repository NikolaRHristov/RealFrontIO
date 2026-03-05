import { UnitImpl } from './UnitImpl';
import { PlayerImpl } from './PlayerImpl';

export class LogisticsManager {
    // Driven by real-world Brent Crude / OPEC data
    public static globalOilPriceMultiplier: number = 1.0;

    /**
     * Updates the global cost of moving heavy machinery.
     */
    public static updateOilPrice(opecMultiplier: number) {
        this.globalOilPriceMultiplier = opecMultiplier;
    }

    /**
     * Processes fuel consumption for mechanized units.
     * Called every game tick.
     */
    public static processFuelConsumption(units: UnitImpl[], player: PlayerImpl) {
        for (const unit of units) {
            // Only mechanized units use fuel
            if (unit.type === 'ARMOR' || unit.type === 'AIRCRAFT' || unit.type === 'NAVAL') {
                
                if (unit.isMoving) {
                    unit.fuel -= 1; // Base consumption rate
                }
                
                if (unit.fuel <= 0) {
                    unit.speed = 0; // Unit is stranded. Armor becomes static pillboxes. Aircraft crash.
                    if (unit.type === 'AIRCRAFT') {
                        unit.hp = 0; // Out of fuel mid-air = destroyed
                    }
                }

                // Resupply Logic: If unit is on a friendly road network or inside a city
                if (unit.fuel < unit.maxFuel && (unit.isOnFriendlySupplyLine || unit.garrisonedCityId)) {
                    // Refueling drains the player's treasury. 
                    // If real-world oil prices spike, players literally cannot afford to move their tanks.
                    const fuelCost = 5 * this.globalOilPriceMultiplier;
                    
                    if (player.money >= fuelCost) {
                        player.money -= fuelCost;
                        unit.fuel += 10;
                    }
                }
            }
        }
    }
}