import { TerrainSearchMap } from './TerrainSearchMap';
import { UnitImpl, UnitType } from './UnitImpl';

export class CBRNManager {
    /**
     * Resolves Chemical, Biological, Radiological, and Nuclear damage
     * to units caught in wind-blown hazard clouds.
     */
    public static applyRadiologicalDamage(units: UnitImpl[], terrainMap: TerrainSearchMap) {
        for (const unit of units) {
            const hazardVector = terrainMap.getHazardVector(unit.x, unit.y);
            const physicalHazard = hazardVector[0]; // Channel 0 holds radiation/chemical data

            // If a unit is standing in a irradiated tile (pushed there by the wind)
            if (physicalHazard > 0.4) {
                // Infantry die rapidly to radiation.
                // Sealed armor (Tanks) take 80% less damage from CBRN environments.
                let mitigation = 1.0;
                if (unit.type === UnitType.ARMOR) {
                    mitigation = 0.2; 
                }

                const damage = (physicalHazard * 10.0) * mitigation;
                unit.hp -= damage;
                
                // Brutalist mechanic: Radiation permanently destroys maximum HP 
                // representing catastrophic hardware failure/crew illness
                unit.maxHp = Math.max(1, unit.maxHp - (damage * 0.5));
            }
        }
    }
}