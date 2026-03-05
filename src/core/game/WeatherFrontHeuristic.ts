import { TerrainSearchMap } from './TerrainSearchMap';
import { UnitImpl } from './UnitImpl';

export class WeatherFrontHeuristic {
    /**
     * Aviation pathfinding modifier.
     * Aircraft read the NOAA Precipitation (13) and Wind (4, 5) channels.
     * If a severe storm cell (hurricane/typhoon) is in the flight path, 
     * the A* cost balloons, forcing the bomber to fly *around* the weather front.
     */
    public static getAviationCost(x: number, y: number, terrainMap: TerrainSearchMap): number {
        const vector = terrainMap.getHazardVector(x, y);
        const windU = Math.abs(vector[4]);
        const windV = Math.abs(vector[5]);
        const precipitation = vector[13];

        const stormSeverity = (windU + windV + precipitation) / 3.0;

        let cost = 10; // Base flight cost (sky is clear)

        if (stormSeverity > 0.8) {
            // Category 4/5 Hurricane equivalent. 
            // Flying through this will crash the plane (handled in movement loop).
            // A* cost is massively inflated to force detours.
            cost += 1000; 
        } else if (stormSeverity > 0.5) {
            // Heavy turbulence, slows the plane down
            cost += 50;
        }

        return cost;
    }
}