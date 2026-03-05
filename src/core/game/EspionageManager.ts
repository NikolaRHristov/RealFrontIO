import { UnitImpl } from './UnitImpl';
import { PlayerImpl } from './PlayerImpl';

export class EspionageManager {
    /**
     * The False Flag operation.
     * A Spy unit can physically spoof its ownerId to match the target enemy.
     * To the enemy player's client, this unit will render with a blue/friendly health bar.
     */
    public static executeFalseFlag(spy: UnitImpl, targetPlayerId: string) {
        if (spy.type !== 'SPY') return;

        // Store original identity
        (spy as any).trueOwnerId = spy.ownerId;
        
        // Swap identity
        spy.ownerId = targetPlayerId;
        (spy as any).isUnderFalseFlag = true;
        (spy as any).falseFlagTimer = 600; // 60 seconds at 10 ticks/sec

        console.log(`[ESPIONAGE] Unit ${spy.id} executed False Flag. Now masquerading as Player ${targetPlayerId}.`);
    }

    public static processTimers(units: UnitImpl[]) {
        for (const unit of units) {
            if ((unit as any).isUnderFalseFlag) {
                (unit as any).falseFlagTimer--;

                // If they fire a weapon, the disguise instantly breaks
                if ((unit as any).hasFiredWeapon || (unit as any).falseFlagTimer <= 0) {
                    unit.ownerId = (unit as any).trueOwnerId;
                    (unit as any).isUnderFalseFlag = false;
                    (unit as any).hasFiredWeapon = false;
                    
                    // Notify nearby enemies of the betrayal
                }
            }
        }
    }
}