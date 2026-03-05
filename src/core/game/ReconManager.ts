import { TerrainSearchMap } from './TerrainSearchMap';

export class ReconManager {
    /**
     * Resolves OpenSky flight data.
     * Real-world airplanes act as temporary recon satellites. If they fly over 
     * the game map, they lift the fog of war for the tiles beneath them.
     */
    public static clearFogOfWar(
        fogGrid: Uint8Array, 
        width: number, 
        height: number, 
        terrainMap: TerrainSearchMap
    ): void {
        // Read Channel 3 (If we repurposed it for Recon in the TerrainSearchMap)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const vector = terrainMap.getHazardVector(x, y);
                const reconSignal = vector[3]; // The OpenSky vector

                // If a real-world plane is flying overhead, clear the fog for all players
                if (reconSignal > 0.0) {
                    const index = y * width + x;
                    fogGrid[index] = 1; // 1 = Visible, 0 = Hidden
                }
            }
        }
    }
}