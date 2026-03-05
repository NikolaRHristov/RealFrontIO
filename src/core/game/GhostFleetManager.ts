import { UnitImpl } from './UnitImpl';
import { PlayerImpl } from './PlayerImpl';

export class GhostFleetManager {
    /**
     * AIS (Automatic Identification System) Spoofing.
     * Cargo ships can engage a cyber-electronic warfare suite to mask their signature.
     * To the enemy's radar and UI, the ship appears as a neutral "Fishing Trawler".
     */
    public static toggleAisSpoofing(ship: UnitImpl, player: PlayerImpl) {
        if (ship.type !== 'CARGO_SHIP') return;

        // Requires high tech level or specific black-market purchase
        if (player.money >= 500) {
            player.money -= 500; // Cost of the spoofing hardware/software
            (ship as any).isAisSpoofed = true;
            
            // Re-assign the visual model/type on the network layer
            // The server's FogOfWarValidator (Batch 74) will now transmit this to enemies
            // as a NEUTRAL_CIVILIAN object, bypassing Naval Blockades (Batch 83).
            console.log(`[CYBER] Cargo Ship ${ship.id} has gone dark. Transmitting false AIS data.`);
        }
    }

    public static validateVisuals(ship: UnitImpl, viewingPlayerId: string): any {
        if ((ship as any).isAisSpoofed && ship.ownerId !== viewingPlayerId) {
            return {
                id: ship.id,
                x: ship.x,
                y: ship.y,
                type: 'FISHING_TRAWLER',
                ownerId: 'CIVILIAN'
            };
        }
        return ship; // Return true data for the owner
    }
}