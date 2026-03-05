import { UnitImpl } from './UnitImpl';

export interface IncomingMissile {
    id: string;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    speed: number;
    hp: number;
}

export class AegisCombatSystem {
    /**
     * Automated Point Defense.
     * Cruisers are equipped with a CIWS/Aegis system that autonomously tracks 
     * and attempts to shoot down incoming anti-ship missiles without player input.
     */
    public static processPointDefense(cruisers: UnitImpl[], missiles: IncomingMissile[]) {
        for (const cruiser of cruisers) {
            if (cruiser.type !== 'CRUISER') continue;

            const engagementRadius = 8; // Tiles
            const interceptionChance = 0.7; // 70% chance to kill the missile per tick it is in range

            for (let i = missiles.length - 1; i >= 0; i--) {
                const missile = missiles[i];
                
                const dist = Math.hypot(missile.x - cruiser.x, missile.y - cruiser.y);
                
                if (dist <= engagementRadius) {
                    console.log(`[AEGIS] Cruiser ${cruiser.id} engaging inbound missile ${missile.id}...`);
                    
                    if (Math.random() < interceptionChance) {
                        console.log(`[AEGIS] INTERCEPT SUCCESSFUL. Missile ${missile.id} destroyed.`);
                        // Render a massive flak explosion on the client
                        missiles.splice(i, 1);
                        break; // Move to next cruiser to prevent double-targeting the same dead missile
                    } else {
                        console.log(`[AEGIS] Intercept failed. Re-engaging next tick.`);
                    }
                }
            }
        }
    }
}