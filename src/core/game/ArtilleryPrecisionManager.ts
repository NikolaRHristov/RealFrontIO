import { TerrainSearchMap } from './TerrainSearchMap';
import { UnitImpl } from './UnitImpl';

export class ArtilleryPrecisionManager {
    /**
     * Interlocks with NOAA Precipitation (Channel 12) & Wind Vectors (Channels 4/5).
     * Extreme low pressure/storm systems create chaotic wind shear, drastically
     * increasing the Circular Error Probable (CEP) of artillery strikes.
     */
    public static distortTargeting(unit: UnitImpl, targetX: number, targetY: number, terrainMap: TerrainSearchMap): {x: number, y: number} {
        if (unit.type !== 'ARTILLERY') return { x: targetX, y: targetY };

        const vector = terrainMap.getHazardVector(targetX, targetY);
        const windU = vector[4];
        const windV = vector[5];
        const stormIntensity = vector[12]; // Rain/Barometric drop

        // Base CEP is 0 (Perfect accuracy)
        let errorRadius = 0;

        // If a massive storm is present, the shell deviates
        if (stormIntensity > 0.4) {
            // Wind pushes the shell off course
            const windMagnitude = Math.sqrt(windU*windU + windV*windV);
            errorRadius = stormIntensity * windMagnitude * 5.0; // Up to 5 tiles of drift
        }

        if (errorRadius > 0) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * errorRadius;
            
            return {
                x: Math.floor(targetX + Math.cos(angle) * distance),
                y: Math.floor(targetY + Math.sin(angle) * distance)
            };
        }

        return { x: targetX, y: targetY };
    }
}