import { UnitImpl } from './UnitImpl';
import { PlayerImpl } from './PlayerImpl';

export class FogOfWarValidator {
    /**
     * Server-side culling to prevent Maphack clients.
     * Before sending the WebSocket payload, the server strips out all enemy unit coordinates
     * that are not within the vision radius of at least one of the player's units.
     */
    public static cullEnemyDataForPlayer(player: PlayerImpl, allUnits: UnitImpl[]): any[] {
        const visibleUnits: any[] = [];
        
        // Get all units owned by this player
        const playerUnits = allUnits.filter(u => u.ownerId === player.id);

        for (const unit of allUnits) {
            // Player always sees their own units
            if (unit.ownerId === player.id) {
                visibleUnits.push(unit);
                continue;
            }

            // Check if any player unit can see this enemy unit
            let isVisible = false;
            for (const pUnit of playerUnits) {
                const visionRange = (pUnit as any).visionRange || 5;
                const dist = Math.hypot(pUnit.x - unit.x, pUnit.y - unit.y);
                
                if (dist <= visionRange) {
                    // Check if enemy is a submarine running silent, or masked by OpenSky spoofing
                    const isSubSilent = unit.type === 'SUBMARINE' && !(unit as any).isAcousticallyDetected;
                    const isSpoofed = (unit as any).isMaskedAsCivilian;

                    if (!isSubSilent && !isSpoofed) {
                        isVisible = true;
                        break;
                    }
                }
            }

            if (isVisible) {
                visibleUnits.push(unit);
            }
            // If not visible, the unit is entirely dropped from the JSON array.
            // The client memory never even knows it exists.
        }

        return visibleUnits;
    }
}