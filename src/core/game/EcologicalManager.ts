import { TerrainSearchMap } from './TerrainSearchMap';
import { WorldHazardEvent } from './GameRunner';

export class EcologicalManager {
    /**
     * Translates NASA FIRMS satellite data into permanent map alterations.
     * Unlike temporary hazards, a massive wildfire permanently burns down
     * forests, altering choke points for the rest of the match.
     */
    public static applyWildfire(event: WorldHazardEvent, terrainMap: TerrainSearchMap, gameMap: any): void {
        if (event.category !== 'HAZARD_WILDFIRE') return;

        const rad = Math.ceil(event.radius);
        
        for (let dy = -rad; dy <= rad; dy++) {
            for (let dx = -rad; dx <= rad; dx++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= event.radius) {
                    const nx = event.center_x + dx;
                    const ny = event.center_y + dy;
                    
                    if (nx >= 0 && nx < terrainMap.width && ny >= 0 && ny < terrainMap.height) {
                        // We must mutate the BASE terrain, not just the hazard scalar
                        const tile = gameMap.getTile(nx, ny);
                        
                        // If the tile is a Forest (e.g., base cost 2)
                        // It becomes Ash/Burnt Forest (base cost 5, stripped of cover bonus)
                        if (tile && tile.type === 'FOREST') {
                            // Only burn if severity (Fire Radiative Power) is high enough
                            const burnChance = event.severity * (1.0 - (distance / event.radius));
                            if (Math.random() < burnChance) {
                                tile.type = 'ASH';
                                // Update the SharedArrayBuffer base cost so A* instantly routes around it
                                const index = ny * terrainMap.width + nx;
                                terrainMap.setBaseCost(index, 5); 
                            }
                        }
                    }
                }
            }
        }
    }
}