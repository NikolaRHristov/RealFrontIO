import { UnitImpl } from './UnitImpl';

export interface FpvDrone {
    x: number;
    y: number;
    battery: number;
    targetId: string | null;
}

export class FpvSwarmManager {
    public static activeSwarms: Map<string, FpvDrone[]> = new Map();

    /**
     * Allows a single Infantry unit to deploy a swarm of cheap, micro-drones.
     * These drones share a Hive-Mind. If one spots an enemy, the others swarm it.
     */
    public static deploySwarm(infantryId: string, startX: number, startY: number, count: number) {
        const swarm: FpvDrone[] = [];
        for (let i = 0; i < count; i++) {
            // Deploy in a loose circle
            const angle = (i / count) * Math.PI * 2;
            swarm.push({
                x: startX + Math.cos(angle),
                y: startY + Math.sin(angle),
                battery: 300, // 30 seconds of flight time
                targetId: null
            });
        }
        this.activeSwarms.set(infantryId, swarm);
    }

    public static processSwarmLogic(enemyUnits: UnitImpl[]) {
        this.activeSwarms.forEach((swarm, infantryId) => {
            // 1. Hive Mind Targeting
            let sharedTarget: string | null = null;
            
            // Check if any drone has found a target
            for (const drone of swarm) {
                if (!drone.targetId) {
                    for (const enemy of enemyUnits) {
                        const dist = Math.hypot(enemy.x - drone.x, enemy.y - drone.y);
                        if (dist <= 3) { // Small vision radius
                            drone.targetId = enemy.id;
                            sharedTarget = enemy.id;
                            break;
                        }
                    }
                } else {
                    sharedTarget = drone.targetId;
                }
            }

            // 2. Swarm Movement & Battery Drain
            for (let i = swarm.length - 1; i >= 0; i--) {
                const drone = swarm[i];
                drone.battery--;

                if (drone.battery <= 0) {
                    swarm.splice(i, 1);
                    continue;
                }

                if (sharedTarget) {
                    drone.targetId = sharedTarget; // Sync target
                    // In full implementation: Pathfind toward target and detonate on impact
                } else {
                    // Random search pattern
                    drone.x += (Math.random() - 0.5);
                    drone.y += (Math.random() - 0.5);
                }
            }
        });
    }
}