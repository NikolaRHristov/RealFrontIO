import { TerrainSearchMap } from './TerrainSearchMap';
import { UnitImpl } from './UnitImpl';

export class OpenSkySpoofingManager {
    /**
     * Interlocks with OpenSky Flight Data (Channel 7).
     * If a real-world commercial flight is passing overhead, military transport planes
     * can physically hide their transponders beneath the commercial radar signature.
     */
    public static checkTransponderStealth(plane: UnitImpl, terrainMap: TerrainSearchMap): boolean {
        if (plane.type !== 'TRANSPORT_PLANE') return false;

        // Check if there is an active commercial flight overhead (OpenSky anomaly)
        const commercialFlightDensity = terrainMap.getHazardVector(plane.x, plane.y)[7];

        // If a Boeing 747 is right above, the military plane inherits its radar cross-section.
        // The SAM sites (from Batch 61) will see it as a civilian target and refuse to fire.
        if (commercialFlightDensity > 0.7) {
            (plane as any).isMaskedAsCivilian = true;
            return true;
        }

        (plane as any).isMaskedAsCivilian = false;
        return false;
    }
}