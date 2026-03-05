import { UnitImpl } from './UnitImpl';
import { TerrainSearchMap } from './TerrainSearchMap';

export class ThermoclineManager {
    /**
     * Advanced Submarine Warfare.
     * Uses the Thermal Channel (1) and standard deep water metrics.
     * Submarines can choose to "Dive Deep", crossing the thermocline layer.
     */
    public static processDepth(submarine: UnitImpl, terrainMap: TerrainSearchMap) {
        if (submarine.type !== 'SUBMARINE') return;

        const isDeepDive = (submarine as any).isDeepDiveActive;

        if (isDeepDive) {
            // Below the thermocline: 
            // 1. Completely immune to surface Sonobuoys (Batch 67)
            (submarine as any).isAcousticallyInvisible = true;
            
            // 2. However, the submarine's own sonar is useless against surface ships
            (submarine as any).visionRange = 0; 

            // 3. Movement speed is halved due to pressure
            (submarine as any).speedModifier = 0.5;
            
        } else {
            // Periscope / Shallow depth
            (submarine as any).isAcousticallyInvisible = false;
            (submarine as any).visionRange = 8;
            (submarine as any).speedModifier = 1.0;
        }
    }
}