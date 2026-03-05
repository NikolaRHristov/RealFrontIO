import { UnitImpl } from './UnitImpl';
import { TerrainSearchMap } from './TerrainSearchMap';

export class InertialNavigationManager {
    /**
     * "Dead Reckoning".
     * If the Orbital/GPS Channel (Channel 3) is jammed or destroyed (via ASAT/Solar Flares),
     * aircraft lose absolute positioning. They mathematically drift off course over time.
     */
    public static applyInertialDrift(aircraft: UnitImpl, terrainMap: TerrainSearchMap) {
        if (aircraft.type !== 'AIRCRAFT' && aircraft.type !== 'BOMBER') return;

        // Check GPS degradation at the aircraft's current perceived location
        const gpsJamming = terrainMap.getHazardVector(Math.floor(aircraft.x), Math.floor(aircraft.y))[3];

        if (gpsJamming > 0.5) {
            // Initialize drift accumulator if it doesn't exist
            if (!(aircraft as any).driftErrorX) (aircraft as any).driftErrorX = 0;
            if (!(aircraft as any).driftErrorY) (aircraft as any).driftErrorY = 0;

            // The longer they fly without GPS, the worse the inertial error gets
            const driftRate = (gpsJamming - 0.5) * 0.2; 
            
            // Apply a slight pseudo-random yaw
            (aircraft as any).driftErrorX += (Math.random() - 0.5) * driftRate;
            (aircraft as any).driftErrorY += (Math.random() - 0.5) * driftRate;

            // Apply the error to their actual physical position
            aircraft.x += (aircraft as any).driftErrorX;
            aircraft.y += (aircraft as any).driftErrorY;
            
            // Note: The UI on the player's screen will STILL SHOW the plane on the intended path.
            // The player won't realize the plane drifted until it misses the target or gets shot down.
        } else {
            // GPS restored, reset inertial measurement unit
            (aircraft as any).driftErrorX = 0;
            (aircraft as any).driftErrorY = 0;
        }
    }
}