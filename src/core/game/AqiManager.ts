import { TerrainSearchMap } from './TerrainSearchMap';
import { UnitImpl } from './UnitImpl';
import { TechTreeManager, TechNode } from './TechTreeManager';
import { PlayerImpl } from './PlayerImpl';

export class AqiManager {
    /**
     * Interlocks with Open-Meteo / EPA Air Quality Index (PM2.5 / PM10).
     * If AQI is hazardous (Wildfire smoke, Industrial sabotage, Volcanic ash),
     * infantry suffer severe respiratory attrition and blindness.
     */
    public static processSmogAttrition(units: UnitImpl[], terrainMap: TerrainSearchMap, players: Map<string, PlayerImpl>) {
        for (const unit of units) {
            if (unit.type !== 'INFANTRY') continue;

            // Using Thermal (Channel 1) and CBRN (Channel 6) as proxies for AQI
            const vector = terrainMap.getHazardVector(unit.x, unit.y);
            const airToxicity = Math.max(vector[1] * 0.5, vector[6]);

            if (airToxicity > 0.4) {
                const player = players.get(unit.ownerId);
                
                // If the player has NBC Seals/Gas Masks, they are immune to the HP drain
                if (!player || !TechTreeManager.hasTech(player, TechNode.NBC_SEALS)) {
                    unit.hp -= (airToxicity * 2.0); // Coughing/Asphyxiation DOT
                }
                
                // Smog physically occludes standard optics regardless of tech
                (unit as any).visionRange = Math.max(1, 5 - Math.floor(airToxicity * 5));
            }
        }
    }
}