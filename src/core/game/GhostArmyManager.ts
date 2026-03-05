import { UnitImpl } from './UnitImpl';

export class GhostArmyManager {
    /**
     * Operation Fortitude / Maskirovka.
     * Engineers can deploy cheap, inflatable rubber tanks.
     * They have 1 HP and cannot move or shoot, but to the enemy's UI and Radar,
     * they render perfectly as HEAVY_ARMOR, forcing the enemy to waste artillery shells.
     */
    public static deployDecoy(engineer: UnitImpl, targetX: number, targetY: number): UnitImpl | null {
        if (engineer.type !== 'ENGINEER') return null;

        console.log(`[DECEPTION] Engineer ${engineer.id} inflating decoy at [${targetX}, ${targetY}]`);

        const decoy = new UnitImpl(`DECOY_${Date.now()}`, engineer.ownerId, 'DECOY_ARMOR', targetX, targetY);
        
        // Setting the trap
        decoy.hp = 1; // Pops instantly if hit
        (decoy as any).isInflatable = true;

        return decoy;
    }

    public static spoofRadarSignature(unit: UnitImpl, viewingPlayerId: string): any {
        // If an enemy is looking at the WebSocket payload, lie to them.
        if (unit.type === 'DECOY_ARMOR' && unit.ownerId !== viewingPlayerId) {
            return {
                id: unit.id,
                x: unit.x,
                y: unit.y,
                type: 'HEAVY_ARMOR', // The Lie
                ownerId: unit.ownerId
            };
        }
        return unit;
    }
}