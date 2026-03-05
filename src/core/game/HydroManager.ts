import { TerrainSearchMap } from './TerrainSearchMap';
import { UnitImpl } from './UnitImpl';

export class HydroManager {
    /**
     * Reads the Precipitation Channel (12) and interacts with GDACS Flood events.
     * If a WGS84 tile is heavily flooded, it destroys ground logistics and washes away troops.
     */
    public static processInundation(units: UnitImpl[], terrainMap: TerrainSearchMap, gameMap: any) {
        for (const unit of units) {
            // Channel 12: Precipitation & Flooding
            const vector = terrainMap.getHazardVector(unit.x, unit.y);
            const precip = vector[12];
            
            if (precip > 0.8) {
                // Severe flooding (GDACS Level 3 equivalent)
                // Washes out roads beneath the unit, permanently destroying the supply line
                const tile = gameMap.getTile(unit.x, unit.y);
                if (tile && tile.hasRoad) {
                    tile.hasRoad = false; 
                }

                // Infantry risk drowning/hypothermia in severe floods
                if (unit.type === 'INFANTRY') {
                    unit.hp -= 0.5;
                    unit.speed *= 0.3; // Slogging through waist-deep water
                }
                
                // Armor suffers from engine waterlogging
                if (unit.type === 'ARMOR') {
                    unit.speed *= 0.5;
                }
            }
        }
    }
}