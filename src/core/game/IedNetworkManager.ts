import { UnitImpl } from './UnitImpl';
import { GameImpl } from './GameImpl';

export interface HiddenIED {
    x: number;
    y: number;
    ownerId: string;
    damage: number;
}

export class IedNetworkManager {
    public static activeIEDs: HiddenIED[] = [];

    /**
     * Partisans and special forces can plant invisible IEDs on the map.
     * They are entirely hidden from the WebSocket payload of enemy players
     * unless the enemy is using FLIR optics (Batch 66) which spots the thermal battery signature.
     */
    public static plantIED(partisan: UnitImpl) {
        if (partisan.type !== 'INFANTRY' || !(partisan as any).isPartisan) return;

        this.activeIEDs.push({
            x: partisan.x,
            y: partisan.y,
            ownerId: partisan.ownerId,
            damage: 200 // Massive damage to light armor
        });

        console.log(`[ASYMMETRIC] IED planted at [${partisan.x}, ${partisan.y}]`);
    }

    public static processTriggers(units: UnitImpl[], game: GameImpl) {
        for (let i = this.activeIEDs.length - 1; i >= 0; i--) {
            const ied = this.activeIEDs[i];

            for (const unit of units) {
                // If a hostile vehicle drives over it
                if (unit.ownerId !== ied.ownerId && unit.type !== 'INFANTRY') {
                    if (Math.floor(unit.x) === ied.x && Math.floor(unit.y) === ied.y) {
                        
                        console.warn(`[IED TRIGGER] Unit ${unit.id} struck an IED!`);
                        unit.hp -= ied.damage;
                        
                        // Remove the IED
                        this.activeIEDs.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
}