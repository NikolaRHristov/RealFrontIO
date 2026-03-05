import { TerrainSearchMap } from './TerrainSearchMap';
import { GameImpl } from './GameImpl';

export interface GeoSat {
    id: string;
    x: number;
    y: number;
    ownerId: string;
    visionRadius: number;
}

export class GeostationaryOrbitManager {
    public static activeSatellites: GeoSat[] = [];

    /**
     * High Orbit Observation.
     * Unlike LEO sweeps (Batch 42), GEO sats stay parked over a specific coordinate.
     * They provide permanent, un-jammable vision of a massive area.
     */
    public static launchGeoSat(x: number, y: number, ownerId: string) {
        this.activeSatellites.push({
            id: `GEO_${Date.now()}`,
            x: x,
            y: y,
            ownerId: ownerId,
            visionRadius: 40 // Massive 40-tile radius
        });
        console.log(`[SPACECOM] GEO Satellite parked at [${x}, ${y}] for Player ${ownerId}.`);
    }

    public static processVision(terrainMap: TerrainSearchMap, game: GameImpl) {
        // GEO Sats sit so high up they bypass ground-based radar jamming.
        // However, if the Kessler Syndrome (Batch 70) gets out of control,
        // debris can strike them on the way up, or ASAT missiles (Batch 81) can target them.
        
        for (let i = this.activeSatellites.length - 1; i >= 0; i--) {
            const sat = this.activeSatellites[i];
            
            // Check for ASAT detonations at this coordinate
            const gpsDegradation = terrainMap.getHazardVector(sat.x, sat.y)[3];
            if (gpsDegradation > 0.9) {
                console.warn(`[SPACECOM] GEO Satellite ${sat.id} destroyed by orbital debris/ASAT!`);
                this.activeSatellites.splice(i, 1);
            } else {
                // In the FogOfWarValidator, this sat's coordinates are passed to ensure
                // the owning player receives all unit data within the 40-tile radius.
            }
        }
    }
}