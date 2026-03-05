import { Container, Graphics } from 'pixi.js';
import { UnitImpl } from '../../core/game/UnitImpl';
import { PlayerImpl } from '../../core/game/PlayerImpl';

export class LogisticsRenderer extends Container {
    private supplyLines: Graphics;

    constructor() {
        super();
        this.supplyLines = new Graphics();
        this.addChild(this.supplyLines);
    }

    /**
     * Renders a dashed PIXI line representing the A* supply chain
     * between a player's city and their forward operating units.
     * If an Earthquake (USGS) severs the road, this line will snap.
     */
    public renderSupplyWeb(player: PlayerImpl, units: UnitImpl[], tileSize: number) {
        this.supplyLines.clear();

        for (const unit of units) {
            // Only draw lines for units that require fuel/ammo (Armor/Arty)
            if (unit.ownerId !== player.id || unit.type === 'INFANTRY') continue;

            if (unit.isOnFriendlySupplyLine) {
                // Find the closest city to draw the tether to
                let closestCity = null;
                let minDist = Infinity;

                for (const city of player.cities) {
                    const dist = Math.sqrt(Math.pow(city.x - unit.x, 2) + Math.pow(city.y - unit.y, 2));
                    if (dist < minDist) {
                        minDist = dist;
                        closestCity = city;
                    }
                }

                if (closestCity) {
                    // Draw a pulsing, dashed green line
                    this.supplyLines.lineStyle({ width: 2, color: 0x00FF00, alpha: 0.5 });
                    this.supplyLines.moveTo(closestCity.x * tileSize, closestCity.y * tileSize);
                    this.supplyLines.lineTo(unit.x * tileSize, unit.y * tileSize);
                }
            } else {
                // If the unit is cut off (e.g. Flood or Earthquake destroyed the road)
                // Draw a flashing red "severed" indicator above the unit
                this.supplyLines.lineStyle({ width: 2, color: 0xFF0000, alpha: 0.8 });
                this.supplyLines.drawCircle(unit.x * tileSize, unit.y * tileSize, 10);
            }
        }
    }
}