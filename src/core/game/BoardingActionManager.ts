import { UnitImpl } from './UnitImpl';

export class BoardingActionManager {
    /**
     * Special Forces can hijack enemy Logistics/Container ships instead of sinking them.
     * If successful, the ship's ownerId flips, and the cargo is stolen.
     */
    public static attemptBoarding(specialForces: UnitImpl, cargoShip: UnitImpl) {
        if (specialForces.type !== 'INFANTRY' || !(specialForces as any).isSpecialForces) return;
        if (cargoShip.type !== 'CARGO_SHIP') return;

        const dist = Math.hypot(specialForces.x - cargoShip.x, specialForces.y - cargoShip.y);
        
        if (dist <= 1.0) { // Point blank range (Zodiac boat approach)
            console.warn(`[PIRACY] Special Forces ${specialForces.id} boarding Cargo Ship ${cargoShip.id}!`);
            
            // 60% chance to succeed
            if (Math.random() > 0.4) {
                // Hijack successful
                cargoShip.ownerId = specialForces.ownerId;
                console.log(`[PIRACY] Boarding successful. Ship captured.`);
            } else {
                // Hijack failed, Special Forces wiped out
                specialForces.hp = 0;
                console.log(`[PIRACY] Boarding repelled. Special Forces eliminated.`);
            }
        }
    }
}