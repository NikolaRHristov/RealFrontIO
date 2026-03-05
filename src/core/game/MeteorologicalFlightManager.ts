import { TerrainSearchMap } from './TerrainSearchMap';
import { UnitImpl } from './UnitImpl';

export class MeteorologicalFlightManager {
    /**
     * Interlocks with NASA FIRMS (Channel 1).
     * Extreme heat on the ground generates massive thermal updrafts.
     * Aircraft flying through these columns consume zero fuel and gain a speed boost.
     */
    public static processThermalUpdrafts(units: UnitImpl[], terrainMap: TerrainSearchMap) {
        for (const unit of units) {
            if (unit.type !== 'AIRCRAFT' && unit.type !== 'DRONE') continue;

            const thermalIntensity = terrainMap.getHazardVector(unit.x, unit.y)[1]; // NASA FIRMS
            
            if (thermalIntensity > 0.5) {
                // Riding the thermal column
                unit.speed *= 1.2; 
                
                // Refund the fuel consumed during this tick by the LogisticsManager
                if (unit.fuel < unit.maxFuel) {
                    unit.fuel += 1; 
                }
            }
        }
    }
}