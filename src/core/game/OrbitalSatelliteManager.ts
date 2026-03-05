import { TerrainSearchMap } from './TerrainSearchMap';

export class OrbitalSatelliteManager {
    public static satellitePositionX: number = 0;
    public static satellitePositionY: number = 0;
    
    /**
     * Simulates a Low Earth Orbit (LEO) satellite pass across the map.
     * Tied to Channel 3 (Orbital/GPS degradation).
     */
    public static updateOrbit(currentTick: number, terrainMap: TerrainSearchMap) {
        // Simple sweeping orbit: diagonally across the map
        const orbitSpeed = 0.5; // Tiles per tick
        
        this.satellitePositionX = (currentTick * orbitSpeed) % terrainMap.width;
        this.satellitePositionY = (currentTick * orbitSpeed * 0.5) % terrainMap.height;

        // The satellite clears the "Fog of War" in a massive 30-tile swath beneath it,
        // BUT its effectiveness is degraded by the Orbital channel (e.g. Solar flares or Anti-Sat lasers)
        const gpsDegradation = terrainMap.getHazardVector(Math.floor(this.satellitePositionX), Math.floor(this.satellitePositionY))[3];
        
        const effectiveRadius = 30 * (1.0 - gpsDegradation); // If degradation is 1.0, radius is 0

        return {
            x: this.satellitePositionX,
            y: this.satellitePositionY,
            radius: effectiveRadius
        };
    }
}