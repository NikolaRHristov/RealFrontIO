import { TerrainSearchMap } from './TerrainSearchMap';

export class OrbitalGuidanceManager {
    /**
     * Calculates the Circular Error Probable (CEP) for long-range precision weapons
     * based on real-world GPS satellite geometry above the target WGS84 coordinates.
     */
    public static calculateMissileDeviation(
        targetX: number, 
        targetY: number, 
        terrainMap: TerrainSearchMap
    ): { actualX: number, actualY: number } {
        // Read Channel 1 (Cyber/Signal) or a dedicated Orbital channel if expanded to 16
        const signalVector = terrainMap.getHazardVector(targetX, targetY);
        
        // We assume index 1 holds the Orbital/GPS coverage scalar (0.0 to 1.0)
        // Injected via the Rust OrbitalMatrix
        const gpsCoverage = signalVector[1]; 

        // If coverage is perfect (1.0), the missile hits exactly.
        if (gpsCoverage >= 0.9) {
            return { actualX: targetX, actualY: targetY };
        }

        // The worse the GPS coverage, the higher the CEP deviation radius.
        // A total dead zone (0.0) means the missile relies on inertial guidance only,
        // which can drift up to 15 tiles off target.
        const maxDeviationTiles = 15;
        const currentDeviationRadius = maxDeviationTiles * (1.0 - Math.max(0.1, gpsCoverage));

        // Generate a random point within the deviation circle
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * currentDeviationRadius;

        const actualX = Math.floor(targetX + Math.cos(angle) * distance);
        const actualY = Math.floor(targetY + Math.sin(angle) * distance);

        console.log(`[ORBITAL] Target locked at ${targetX},${targetY}. GPS Coverage: ${(gpsCoverage*100).toFixed(0)}%. Missile drifted to ${actualX},${actualY}.`);

        return { actualX, actualY };
    }
}