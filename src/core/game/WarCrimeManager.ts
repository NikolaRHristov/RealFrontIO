import { DiplomacyManager } from './DiplomacyManager';
import { UnitImpl } from './UnitImpl';

export class WarCrimeManager {
    /**
     * The Geneva Convention Matrix.
     * Hooks into the combat loop. If Player A attacks a Civilian Refugee Swarm (Batch 40),
     * the UN AI immediately sanctions them.
     */
    public static registerAttack(attacker: UnitImpl, target: UnitImpl) {
        // Check if target is the Neutral Civilian Refugee Swarm
        if ((target as any).isRefugee) {
            console.warn(`[WAR CRIME] Player ${attacker.ownerId} fired upon civilian refugees!`);
            
            // The Spymaster AI (acting as the UN) instantly slaps a global embargo on the attacker.
            // This triggers the Morale collapse (Batch 22) and blocks their supply lines.
            DiplomacyManager.enforceSanction(attacker.ownerId, "UNITED_NATIONS_AI");
            
            // Flag the player's account (can be tied to UI ticker tape)
            // EventTicker.pushEvent("UN_TRIBUNAL", `Player ${attacker.ownerId} indicted for war crimes.`);
        }
    }
}