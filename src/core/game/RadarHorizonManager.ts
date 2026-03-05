import { TerrainSearchMap } from './TerrainSearchMap';
import { UnitImpl } from './UnitImpl';

export class RadarHorizonManager {
    /**
     * Calculates 3D Line-of-Sight between a SAM site and an Aircraft.
     * Uses SRTM Elevation data (Channel 15) to check if a mountain blocks the radar.
     */
    public static hasRadarLock(samX: number, samY: number, planeX: number, planeY: number, planeAltitude: number, terrainMap: TerrainSearchMap): boolean {
        // Bresenham's Line Algorithm
        const dx = Math.abs(planeX - samX);
        const dy = Math.abs(planeY - samY);
        const sx = (samX < planeX) ? 1 : -1;
        const sy = (samY < planeY) ? 1 : -1;
        let err = dx - dy;

        let currX = samX;
        let currY = samY;

        while (true) {
            if (currX === planeX && currY === planeY) break;

            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; currX += sx; }
            if (e2 < dx) { err += dx; currY += sy; }

            // Check elevation at this intermediate point
            const elevation = terrainMap.getHazardVector(currX, currY)[15];
            
            // If the mountain is higher than the plane's altitude, radar lock is broken
            if (elevation > planeAltitude) {
                return false;
            }
        }

        return true; // No mountains in the way
    }
}