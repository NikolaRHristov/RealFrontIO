import { TerrainSearchMap } from './TerrainSearchMap';

export class HazardPropagationEngine {
    /**
     * Cellular Automaton: Pushes radiation, chemical weapons, or wildfire smoke 
     * across the map based on real-world NOAA wind vectors.
     */
    public static stepWindPropagation(
        terrainMap: TerrainSearchMap, 
        windVectors: Map<string, {u: number, v: number}>
    ) {
        const tempBuffer = new Float32Array(terrainMap.memoryBuffer.byteLength);
        const originalGrid = terrainMap.getPhysicalHazardChannel(); // Extract channel 0 (Physical)

        // Iterate through every tile on the map
        for (let y = 0; y < terrainMap.height; y++) {
            for (let x = 0; x < terrainMap.width; x++) {
                const index = y * terrainMap.width + x;
                const currentHazard = originalGrid[index];

                if (currentHazard > 0.1) { // If there is a fire/radiation cloud here
                    // Look up real-world wind speed and direction
                    const wind = this.getWindAt(x, y, windVectors);
                    
                    // Calculate advection (where the wind pushes the hazard)
                    // Math.sign determines grid step direction, abs determines strength
                    const targetX = x + Math.sign(wind.u);
                    const targetY = y + Math.sign(wind.v);

                    if (targetX >= 0 && targetX < terrainMap.width && targetY >= 0 && targetY < terrainMap.height) {
                        const targetIndex = targetY * terrainMap.width + targetX;
                        
                        // Push 20% of the hazard volume into the downwind tile
                        const blownHazard = currentHazard * 0.2 * Math.max(Math.abs(wind.u), Math.abs(wind.v));
                        
                        tempBuffer[targetIndex] += blownHazard;
                        tempBuffer[index] -= blownHazard; // Remove it from current tile
                    }
                }
            }
        }

        // Write the calculated wind advection back into the SharedArrayBuffer
        for (let i = 0; i < originalGrid.length; i++) {
            terrainMap.setPhysicalHazard(i, Math.max(0.0, originalGrid[i] + tempBuffer[i]));
        }
    }

    private static getWindAt(x: number, y: number, windVectors: Map<string, {u: number, v: number}>) {
        // Helper to query the nearest WGS84 wind station data
        return windVectors.get(`${x},${y}`) || {u: 0, v: 0};
    }
}