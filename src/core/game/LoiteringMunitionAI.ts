import { UnitImpl } from './UnitImpl';

export class LoiteringMunitionAI {
    /**
     * "Kamikaze Drones".
     * They circle a designated WGS84 coordinate. If an enemy vehicle enters their
     * search radius, they break orbit and dive-bomb the target autonomously.
     */
    public static processOrbit(drone: UnitImpl, enemyUnits: UnitImpl[]) {
        if (drone.type !== 'LOITERING_MUNITION') return;

        const orbitCenterX = (drone as any).orbitX;
        const orbitCenterY = (drone as any).orbitY;
        const searchRadius = 15;

        // If it already found a target, skip search and move to intercept
        if ((drone as any).lockedTargetId) {
            // (Pathfinding/intercept logic handled in movement loop)
            return;
        }

        // Search for highest value target (Heavy Armor preferred)
        let bestTarget: UnitImpl | null = null;
        let bestScore = -1;

        for (const enemy of enemyUnits) {
            const dist = Math.hypot(enemy.x - orbitCenterX, enemy.y - orbitCenterY);
            
            if (dist <= searchRadius) {
                let score = 0;
                if (enemy.type === 'HEAVY_ARMOR') score = 100;
                else if (enemy.type === 'LIGHT_ARMOR') score = 50;
                else if (enemy.type === 'INFANTRY') score = 10;

                // Subtract distance so it attacks the closest high-value target
                score -= dist;

                if (score > bestScore) {
                    bestScore = score;
                    bestTarget = enemy;
                }
            }
        }

        if (bestTarget) {
            (drone as any).lockedTargetId = bestTarget.id;
            console.log(`[DRONE AI] Munition ${drone.id} locked onto target ${bestTarget.id}. Breaking orbit.`);
        } else {
            // Standard circular loiter logic (handled by movement engine)
        }
    }
}