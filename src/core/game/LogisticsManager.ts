import { UnitImpl, UnitType } from './UnitImpl';

export class LogisticsManager {
    /**
     * Tanks and vehicles burn fuel per tile moved.
     * If they hit 0, they physically cannot be issued move commands.
     */
    public static processFuelBurn(unit: UnitImpl, distanceMoved: number) {
        // Infantry don't burn fuel. Base bases/turrets don't move.
        if (unit.type === 'INFANTRY' || unit.type === 'HQ') return;

        // Base burn rate
        let burnRate = 0.5;
        
        // Heavy armor burns more
        if (unit.type === 'HEAVY_ARMOR') burnRate = 1.5;

        // Apply burn
        (unit as any).currentFuel = ((unit as any).currentFuel || 100) - (distanceMoved * burnRate);

        if ((unit as any).currentFuel <= 0) {
            (unit as any).currentFuel = 0;
            (unit as any).isImmobilized = true;
            // The client will render a red "Out of Fuel" icon over the unit
        }
    }

    /**
     * Fuel trucks can refill nearby immobilized vehicles.
     */
    public static executeResupply(truck: UnitImpl, targets: UnitImpl[]) {
        if (truck.type !== 'SUPPLY_TRUCK') return;

        for (const target of targets) {
            const dist = Math.hypot(target.x - truck.x, target.y - truck.y);
            if (dist <= 2.0 && (target as any).isImmobilized) {
                (target as any).currentFuel = 100;
                (target as any).isImmobilized = false;
                console.log(`[LOGISTICS] Unit ${target.id} refueled by Supply Truck ${truck.id}.`);
            }
        }
    }
}