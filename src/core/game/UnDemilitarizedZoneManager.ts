import { GameImpl } from './GameImpl';
import { PlayerImpl } from './PlayerImpl';
import { DiplomacyManager } from './DiplomacyManager';
import { GlobalEventTicker } from '../../client/ui/GlobalEventTicker';

export interface DMZ {
    x: number;
    y: number;
    radius: number;
    active: boolean;
}

export class UnDemilitarizedZoneManager {
    public static activeZones: DMZ[] = [];

    /**
     * The Spymaster AI can declare specific coordinates as a UN DMZ.
     * If any player fires a weapon whose trajectory intersects this radius,
     * they are immediately hit with global Casus Belli.
     */
    public static declareZone(x: number, y: number, radius: number) {
        this.activeZones.push({ x, y, radius, active: true });
        GlobalEventTicker.prototype.pushEvent("UNITED_NATIONS", `DMZ DECLARED AT [${x}, ${y}]. ALL HOSTILITIES MUST CEASE IMMEDIATELY.`);
    }

    public static checkViolation(attackerId: string, targetX: number, targetY: number, game: GameImpl) {
        for (const zone of this.activeZones) {
            const dist = Math.hypot(targetX - zone.x, targetY - zone.y);
            if (dist <= zone.radius && zone.active) {
                
                console.warn(`[WAR CRIME] Player ${attackerId} violated the DMZ!`);
                
                // Instantly grant a temporary damage buff to all other players against the violator
                const players = game.getPlayers();
                for (const player of players) {
                    if (player.id !== attackerId) {
                        DiplomacyManager.grantCasusBelli(player.id, attackerId);
                        (player as any).righteousFuryBuff = 1.25; // +25% damage
                    }
                }

                zone.active = false; // Zone is broken
                break;
            }
        }
    }
}