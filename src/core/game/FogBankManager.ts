import { TerrainSearchMap } from './TerrainSearchMap';
import { UnitImpl } from './UnitImpl';

export class FogBankManager {
    /**
     * Interacts with NOAA Humidity and Temperature channels.
     * If the delta is tight (dew point reached) over a water tile, a thick fog bank rolls in.
     */
    public static applyFogOcclusion(units: UnitImpl[], terrainMap: TerrainSearchMap) {
        for (const unit of units) {
            
            // Only affect naval units for this specific weather phenomenon
            if (unit.type === 'DESTROYER' || unit.type === 'SUBMARINE') {
                
                const vector = terrainMap.getHazardVector(unit.x, unit.y);
                const humidity = vector[12]; // Repurposing Soil Moisture as Humidity
                const temp = vector[1];      // Thermal
                
                // Crude dew point simulation: High humidity, low/moderate temp
                if (humidity > 0.8 && temp < 0.4) {
                    // Thick fog bank. Radar is useless, vision is heavily restricted.
                    (unit as any).visionRange = 2; // Point blank range
                    (unit as any).isInFogBank = true;
                } else {
                    // Restore standard vision (e.g. 10 tiles)
                    if ((unit as any).isInFogBank) {
                        (unit as any).visionRange = 10;
                        (unit as any).isInFogBank = false;
                    }
                }
            }
        }
    }
}