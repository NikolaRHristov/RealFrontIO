import { TerrainSearchMap } from './TerrainSearchMap';
import { PlayerImpl } from './PlayerImpl';

export class ClimateCatastropheManager {
    public static globalSootLevel: number = 0.0; // 0.0 to 1.0

    /**
     * If enough IAEA Nuclear events (Channel 6) or extreme NASA Wildfires (Channel 1)
     * detonate, the global ash/soot level rises. 
     * At 1.0, the planet enters Nuclear Winter.
     */
    public static evaluateNuclearWinter(terrainMap: TerrainSearchMap, players: PlayerImpl[]) {
        let totalAsh = 0;
        const gridArea = terrainMap.width * terrainMap.height;
        
        // Sample the grid (every 10th tile for performance)
        for (let i = 0; i < gridArea; i += 10) {
            const x = i % terrainMap.width;
            const y = Math.floor(i / terrainMap.width);
            const vectors = terrainMap.getHazardVector(x, y);
            
            totalAsh += vectors[1]; // Thermal / Ash
            totalAsh += vectors[6]; // Radiation
        }

        // Normalize
        this.globalSootLevel = Math.min(1.0, totalAsh / 5000.0);

        if (this.globalSootLevel > 0.8) {
            console.warn("[CATASTROPHE] NUCLEAR WINTER THRESHOLD CROSSED.");
            // 1. Global UI Shader Darkens (Handled in WebGL Uniforms)
            // 2. Global Crop Failure (City incomes drop to zero)
            for (const player of players) {
                for (const city of player.cities) {
                    city.baseIncome = 0; // Absolute famine
                }
            }
        }
    }
}