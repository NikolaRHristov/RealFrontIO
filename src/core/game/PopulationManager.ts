import { TerrainSearchMap } from './TerrainSearchMap';
import { PlayerImpl } from './PlayerImpl';

export class PopulationManager {
    /**
     * Translates WGS84 agricultural disasters (FAO Droughts, Locusts) into
     * catastrophic population decline, permanently crippling a city's economic output.
     */
    public static processStarvation(players: PlayerImpl[], terrainMap: TerrainSearchMap) {
        for (const player of players) {
            for (const city of player.cities) {
                
                // We read from the Economic Sanction / Starvation Channel (Index 9)
                // Mixed with the actual Precipitation Channel (Index 12).
                const vectors = terrainMap.getHazardVector(city.x, city.y);
                const economicCollapse = vectors[9];
                const precipitation = vectors[12];

                // If precipitation is 0.0 (Absolute Drought) and Economic Stress is high
                if (precipitation < 0.05 && economicCollapse > 0.6) {
                    
                    // City population/baseIncome permanently degrades due to famine
                    const attrition = economicCollapse * 0.1;
                    city.baseIncome = Math.max(1, city.baseIncome - attrition);
                    
                    // Starvation breeds Civil Unrest (Feedback loop into Channel 7)
                    terrainMap.applyImpulseToChannel(city.x, city.y, 5, attrition * 2.0, 7);
                }
            }
        }
    }
}