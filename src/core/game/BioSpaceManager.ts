import { TerrainSearchMap } from './TerrainSearchMap';
import { UnitImpl } from './UnitImpl';

export class BioSpaceManager {
    /**
     * Resolves the missing worldmonitor features utilizing the final two Expansion Channels
     * Channel 14: Biological Hazard (Disease Outbreaks)
     * Channel 15: Geomagnetic Storm (Solar Flares / Space Weather)
     */
    public static resolveBioAndSpaceHazards(units: UnitImpl[], terrainMap: TerrainSearchMap, globalSpaceWeatherSeverity: number) {
        
        // 1. SPACE WEATHER (Global EMP / Radar Jamming)
        // If Kp index > 7 in the real world, global comms and aviation are disrupted.
        const isGeomagneticStorm = globalSpaceWeatherSeverity > 0.7;

        for (const unit of units) {
            const vector = terrainMap.getHazardVector(unit.x, unit.y);
            const bioHazard = vector[14]; // Real-world pandemic/disease data

            // 2. BIOLOGICAL HAZARDS (Viral Spread)
            if (bioHazard > 0.2) {
                // Infantry catch the disease
                if (unit.type === 'INFANTRY') {
                    (unit as any).isInfected = true;
                }
            }

            // Infection Logic (Decays HP over time, halves movement speed)
            if ((unit as any).isInfected) {
                unit.hp -= 0.5; // Attrition
                // Units spread it to other units in the same tile
                // (Engine hook requires checking units sharing coordinates)
            }

            // 3. APPLY SPACE WEATHER DEBUFFS
            if (isGeomagneticStorm) {
                // Drones and Aircraft are grounded or crash
                if (unit.type === 'AIRCRAFT' || unit.type === 'DRONE') {
                    unit.hp -= 5.0; // Avionics fry
                }
                
                // Advanced radar units lose their sight radius
                if (unit.type === 'RADAR' || unit.type === 'ANTI_AIR') {
                    (unit as any).visionRange = 2; // Blinded by solar radiation
                }
            }
        }
    }

    /**
     * Project the bio-hazard event into Channel 14
     */
    public static applyBioEventToGrid(centerX: number, centerY: number, radius: number, severity: number, terrainMap: TerrainSearchMap) {
        terrainMap.applyImpulseToChannel(centerX, centerY, radius, severity, 14);
    }
}