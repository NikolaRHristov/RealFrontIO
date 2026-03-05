import { TerrainSearchMap } from './TerrainSearchMap';
import { UnitImpl } from './UnitImpl';

export class AviationManager {
    /**
     * Processes WGS84 specific airborne threats (Volcanic Ash, No-Fly Zones)
     */
    public static processAirspaceHazards(units: UnitImpl[], terrainMap: TerrainSearchMap) {
        for (const unit of units) {
            if (unit.type !== 'AIRCRAFT' && unit.type !== 'DRONE') continue;

            const vectors = terrainMap.getHazardVector(unit.x, unit.y);
            
            // Channel 11: Mapped to OpenSky / FAA NOTAM Airspace Control
            const notamBlock = vectors[11]; 
            
            // Channel 1: Thermal/Fires. Volcanic Ash (VAAC) is mapped here as massive heat + ash plumes
            const thermalAsh = vectors[1]; 

            // 1. FAA No-Fly Zones
            if (notamBlock > 0.8) {
                // Aircraft illegally flying through a highly restricted WGS84 airspace
                // take automatic damage from "Global Air Defense" simulating shot-down scenarios.
                unit.hp -= 10; 
            }

            // 2. VAAC Volcanic Ash / NASA Extreme Wildfire Smoke
            if (thermalAsh > 0.7) {
                // Ash is catastrophic to jet engine intakes.
                unit.hp -= 5;
                unit.speed *= 0.5; // Engine flameout/choking
            }
        }
    }
}