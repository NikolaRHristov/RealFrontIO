import { UnitImpl } from './UnitImpl';

export interface TriangulationEllipse {
    centerX: number;
    centerY: number;
    radiusX: number;
    radiusY: number;
    ownerId: string;
}

export class ElectronicWarfareManager {
    public static activeEllipses: TriangulationEllipse[] = [];

    /**
     * When units fire Artillery or activate high-powered Radar, they emit signals.
     * EW planes can intercept these. We draw an "Uncertainty Ellipse" on the enemy's minimap.
     */
    public static triangulateEmission(emittingUnit: UnitImpl, interceptingPlayerId: string, signalStrength: number) {
        // The stronger the signal (or the closer the EW plane), the tighter the ellipse.
        // A weak interception gives a massive 20-tile wide search area.
        
        const accuracy = Math.max(1, 20 - (signalStrength * 10)); // 1 is pinpoint, 20 is vague
        
        // Add random offset so the center isn't exactly the unit
        const offsetX = (Math.random() - 0.5) * accuracy;
        const offsetY = (Math.random() - 0.5) * accuracy;

        this.activeEllipses.push({
            centerX: emittingUnit.x + offsetX,
            centerY: emittingUnit.y + offsetY,
            radiusX: accuracy * (1 + Math.random()),
            radiusY: accuracy * (1 + Math.random()),
            ownerId: interceptingPlayerId // Only this player's UI will see it
        });
    }

    public static clearOldEllipses() {
        // Ellipses fade after 1 tick. The UI renderer will fade them out.
        this.activeEllipses = [];
    }
}