import { Container, Graphics, Text } from 'pixi.js';
import { UnitImpl } from '../../../core/game/UnitImpl';

export class NatoSymbologyRenderer {
    /**
     * Renders standard APP-6A NATO tactical symbols.
     * Replaces 3D models when zoomed out or when the "Tactical View" toggle is active.
     */
    public static drawSymbol(unit: UnitImpl, isFriendly: boolean): Container {
        const container = new Container();
        const gfx = new Graphics();
        
        // Hostile = Red Diamond, Friendly = Blue Rectangle
        const color = isFriendly ? 0x00aaff : 0xff0000;
        
        gfx.lineStyle(2, color, 1);
        gfx.beginFill(color, 0.2);

        if (isFriendly) {
            gfx.drawRect(-15, -10, 30, 20); // Rectangle
        } else {
            // Diamond
            gfx.moveTo(0, -15);
            gfx.lineTo(15, 0);
            gfx.lineTo(0, 15);
            gfx.lineTo(-15, 0);
            gfx.closePath();
        }
        gfx.endFill();

        // Inner modifiers (e.g. 'X' for Infantry, Oval for Armor)
        gfx.lineStyle(2, color, 1);
        if (unit.type === 'INFANTRY') {
            // Draw X
            gfx.moveTo(-10, -5);
            gfx.lineTo(10, 5);
            gfx.moveTo(-10, 5);
            gfx.lineTo(10, -5);
        } else if (unit.type === 'HEAVY_ARMOR' || unit.type === 'LIGHT_ARMOR') {
            // Draw Oval
            gfx.drawEllipse(0, 0, 8, 4);
        }

        container.addChild(gfx);
        return container;
    }
}