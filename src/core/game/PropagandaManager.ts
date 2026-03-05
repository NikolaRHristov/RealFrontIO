import { UnitImpl } from './UnitImpl';
import { TerrainSearchMap } from './TerrainSearchMap';

export class PropagandaManager {
    /**
     * Interacts with ACLED Civil Unrest data (Channel 10).
     * Air units can deploy PSYOP/Leaflet drops. If a region is already experiencing
     * real-world civil unrest, the morale damage to enemy infantry is multiplied exponentially.
     */
    public static executeLeafletDrop(bomber: UnitImpl, radius: number, enemyUnits: UnitImpl[], terrainMap: TerrainSearchMap) {
        const unrestSeverity = terrainMap.getHazardVector(bomber.x, bomber.y)[10];
        
        // Base psychological impact
        let baseMoraleDamage = 10;
        
        // If the local civilian population is already rioting (via ACLED data), 
        // the propaganda finds highly receptive, demoralized troops.
        if (unrestSeverity > 0.5) {
            baseMoraleDamage *= (1.0 + unrestSeverity * 2);
        }

        for (const unit of enemyUnits) {
            if (unit.type === 'INFANTRY') {
                const dist = Math.hypot(unit.x - bomber.x, unit.y - bomber.y);
                if (dist <= radius) {
                    unit.morale -= baseMoraleDamage;
                    
                    if (unit.morale <= 0) {
                        // Troops route/surrender
                        (unit as any).isRouted = true;
                    }
                }
            }
        }
    }
}