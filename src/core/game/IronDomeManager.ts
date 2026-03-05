import { UnitImpl } from './UnitImpl';

export interface IncomingShell {
    id: string;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
}

export class IronDomeManager {
    /**
     * Stationary CIWS/Phalanx base defenses.
     * Automatically calculates intercept vectors for incoming artillery shells
     * and loitering munitions (kamikaze drones).
     */
    public static processInterceptions(turrets: UnitImpl[], incomingMunitions: IncomingShell[]) {
        for (const turret of turrets) {
            if (turret.type !== 'CIWS_TURRET') continue;

            // Turrets can only intercept a certain number of targets per tick (e.g., 2)
            let interceptsRemaining = 2;
            const engagementRadius = 5; // Very short range, last line of defense

            for (let i = incomingMunitions.length - 1; i >= 0; i--) {
                if (interceptsRemaining <= 0) break;

                const munition = incomingMunitions[i];
                const dist = Math.hypot(munition.x - turret.x, munition.y - turret.y);

                if (dist <= engagementRadius) {
                    console.log(`[IRON DOME] Turret ${turret.id} tracking incoming munition ${munition.id}...`);
                    
                    // 85% chance to destroy the shell mid-air
                    if (Math.random() < 0.85) {
                        incomingMunitions.splice(i, 1);
                        interceptsRemaining--;
                        console.log(`[IRON DOME] Intercept successful. Munition destroyed.`);
                    }
                }
            }
        }
    }
}