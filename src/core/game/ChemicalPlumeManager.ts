import { TerrainSearchMap } from './TerrainSearchMap';

export interface ChemicalPlume {
    x: number;
    y: number;
    toxicity: number;
    radius: number;
}

export class ChemicalPlumeManager {
    public static activePlumes: ChemicalPlume[] = [];

    /**
     * Hooks into NOAA Wind U/V (Channels 4 & 5).
     * If a chemical plant is destroyed or a CBRN weapon is used, the toxic cloud
     * physically drifts downwind, carrying its lethal payload across the map.
     */
    public static advectPlumes(terrainMap: TerrainSearchMap) {
        for (let i = this.activePlumes.length - 1; i >= 0; i--) {
            const plume = this.activePlumes[i];

            // Get local wind vectors
            const vector = terrainMap.getHazardVector(Math.floor(plume.x), Math.floor(plume.y));
            const windU = vector[4]; // East-West
            const windV = vector[5]; // North-South

            // Plume drifts with the wind
            plume.x += windU * 0.5;
            plume.y += windV * 0.5;

            // Plume dissipates over time and spreads out
            plume.toxicity -= 0.01;
            plume.radius += 0.1;

            if (plume.toxicity <= 0) {
                this.activePlumes.splice(i, 1);
            } else {
                // Write the toxicity back into the CBRN channel (Channel 6) 
                // so the AqiManager and Infantry routing logic can detect it.
                terrainMap.setHazardChannel(Math.floor(plume.x), Math.floor(plume.y), 6, plume.toxicity);
            }
        }
    }
}