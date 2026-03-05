import { PlayerImpl } from './PlayerImpl';
import { UnitImpl } from './UnitImpl';
import { TechNode, TechTreeManager } from './TechTreeManager';

export class FaradayShieldManager {
    /**
     * Counter-measure to the EmpManager (Batch 76).
     * If a player researches FARADAY_CAGES, their HQ and specific heavy vehicles
     * are granted immunity to the electronic wipeout radius of a nuclear blast.
     */
    public static checkEmpImmunity(unit: UnitImpl, player: PlayerImpl): boolean {
        // Check if the player has unlocked the tech
        if (TechTreeManager.hasTech(player, TechNode.FARADAY_CAGES)) {
            
            // Only HQs, CIWS Turrets, and Heavy Armor get the heavy copper shielding.
            // Aircraft and light infantry comms are still fried.
            if (unit.type === 'HQ' || unit.type === 'CIWS_TURRET' || unit.type === 'HEAVY_ARMOR') {
                return true; // Immune
            }
        }
        return false; // Vulnerable
    }
}