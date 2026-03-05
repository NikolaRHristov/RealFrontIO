import { UnitImpl } from './UnitImpl';
import { PlayerImpl } from './PlayerImpl';

export class CasevacManager {
    /**
     * Triage logic. When infantry hit 0 HP, they don't die instantly.
     * They become 'WOUNDED'. If a medical chopper picks them up within 60 seconds
     * and returns to a city, the player gets their manpower/ticket refunded.
     */
    public static evaluateCasualties(units: UnitImpl[]) {
        for (const unit of units) {
            if (unit.type === 'INFANTRY' && unit.hp <= 0 && !(unit as any).isWounded && !(unit as any).isDead) {
                
                // Enter triage state
                (unit as any).isWounded = true;
                (unit as any).bleedOutTimer = 600; // 60 seconds
                (unit as any).isImmobilized = true;
                
                // Prevent standard destruction cleanup
                unit.hp = 1; 
            }
        }
    }

    public static processBleedOut(units: UnitImpl[]) {
        for (const unit of units) {
            if ((unit as any).isWounded) {
                (unit as any).bleedOutTimer--;
                if ((unit as any).bleedOutTimer <= 0) {
                    (unit as any).isDead = true; // Permanently removed from game
                    unit.hp = 0;
                }
            }
        }
    }

    public static executeEvac(chopper: UnitImpl, woundedUnit: UnitImpl, player: PlayerImpl) {
        if (chopper.type !== 'HELICOPTER') return;
        
        // Load the wounded onto the chopper
        (chopper as any).cargo = woundedUnit;
        
        // Remove wounded from physical map
        (woundedUnit as any).isDead = true; 
        
        // If the chopper makes it back to a city, the player gets +1 Manpower refunded 
        // (Handled in city arrival logic)
    }
}