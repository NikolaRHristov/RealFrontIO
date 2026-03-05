import { UnitImpl } from './UnitImpl';

export interface SonobuoyPing {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    intensity: number;
}

export class AcousticWarfareManager {
    public static activePings: SonobuoyPing[] = [];

    /**
     * Submarines are inherently invisible to radar.
     * Destroyers drop Sonobuoys which generate expanding acoustic rings.
     * If a submarine is moving fast (cavitation), it becomes visible when a ring hits it.
     */
    public static processAcoustics(units: UnitImpl[]) {
        // Expand active pings
        for (let i = this.activePings.length - 1; i >= 0; i--) {
            const ping = this.activePings[i];
            ping.radius += 1.0; // Speed of sound expansion
            ping.intensity -= 0.02; // Fade out

            if (ping.intensity <= 0 || ping.radius >= ping.maxRadius) {
                this.activePings.splice(i, 1);
                continue;
            }

            // Check for submarine intersection
            for (const unit of units) {
                if (unit.type === 'SUBMARINE') {
                    const dist = Math.hypot(unit.x - ping.x, unit.y - ping.y);
                    
                    // If the ping line is currently passing over the submarine
                    if (Math.abs(dist - ping.radius) < 1.0) {
                        
                        // Submarines running silent (not moving) barely reflect sound
                        const speed = (unit as any).currentSpeed || 0;
                        if (speed > 0) {
                            (unit as any).isAcousticallyDetected = true;
                            // Reset visibility timer (e.g. visible for 3 ticks)
                            (unit as any).detectionTimer = 3; 
                        }
                    }
                }
            }
        }
    }
}