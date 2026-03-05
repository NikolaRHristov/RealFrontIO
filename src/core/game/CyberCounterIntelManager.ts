import { UnitImpl } from './UnitImpl';
import { PlayerImpl } from './PlayerImpl';

export class CyberCounterIntelManager {
    /**
     * Counter-play to Spies and the False Flag operation (Batch 68).
     * Players can build a "Honeypot Server" in their HQ.
     */
    public static detectIntrusion(spy: UnitImpl, targetPlayer: PlayerImpl): boolean {
        // Check if the target player has built the Honeypot infrastructure
        if ((targetPlayer as any).hasHoneypot) {
            
            // 50% chance to trap the spy during a False Flag attempt
            if (Math.random() > 0.5) {
                console.warn(`[COUNTER-INTEL] Spy ${spy.id} trapped by Honeypot! Intrusion traced.`);
                
                // The spy is instantly executed
                spy.hp = 0;

                // The reverse-trace reveals the EXACT coordinates of the Spy's owning player's Capital
                return true; 
            }
        }
        return false;
    }
}