import { UnitImpl } from './UnitImpl';

export interface UnexplodedOrdnance {
    x: number;
    y: number;
    damage: number;
}

export class ClusterMunitionManager {
    public static activeUxo: UnexplodedOrdnance[] = [];

    /**
     * When a cluster bomb detonates, it spawns 50 micro-explosions.
     * However, 10% of them fail to detonate (UXO). These become permanent, invisible
     * landmines that sit on the map for the rest of the game, killing infantry.
     */
    public static detonateCluster(targetX: number, targetY: number, units: UnitImpl[]) {
        const subMunitionCount = 50;
        const radius = 5;

        let uxoGenerated = 0;

        for (let i = 0; i < subMunitionCount; i++) {
            // Scatter randomly within radius
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * radius;
            const bombX = Math.floor(targetX + Math.cos(angle) * dist);
            const bombY = Math.floor(targetY + Math.sin(angle) * dist);

            // 10% dud rate
            if (Math.random() < 0.10) {
                this.activeUxo.push({
                    x: bombX,
                    y: bombY,
                    damage: 100 // Lethal to infantry and light vehicles
                });
                uxoGenerated++;
            } else {
                // Immediate detonation logic: damage anything on this tile
                for (const unit of units) {
                    if (Math.floor(unit.x) === bombX && Math.floor(unit.y) === bombY) {
                        unit.hp -= 50;
                    }
                }
            }
        }

        console.log(`[ARTILLERY] Cluster Strike complete. Left behind ${uxoGenerated} UXO duds.`);
    }

    public static processUxoTriggers(units: UnitImpl[]) {
        for (let i = this.activeUxo.length - 1; i >= 0; i--) {
            const uxo = this.activeUxo[i];

            for (const unit of units) {
                if (Math.floor(unit.x) === uxo.x && Math.floor(unit.y) === uxo.y) {
                    console.warn(`[UXO] Unit ${unit.id} stepped on an unexploded cluster bomblet!`);
                    unit.hp -= uxo.damage;
                    this.activeUxo.splice(i, 1);
                    break;
                }
            }
        }
    }
}