import { TerrainSearchMap } from './TerrainSearchMap';
import { GameImpl } from './GameImpl';
import { UnitImpl, UnitType } from './UnitImpl';

export class NavalMineManager {
    /**
     * Interlocks with NOAA Ocean Currents (Mapped to Wind U/V Channels 4 & 5 over water).
     * When players deploy naval mines, they aren't static. Strong real-world currents
     * will physically drift the mines across the map.
     */
    public static processDriftingMines(game: GameImpl, terrainMap: TerrainSearchMap) {
        const units = game.getUnits();
        
        for (const unit of units) {
            if (unit.type !== 'NAVAL_MINE') continue;

            const vector = terrainMap.getHazardVector(unit.x, unit.y);
            const currentU = vector[4]; // East/West flow
            const currentV = vector[5]; // North/South flow

            // If currents are strong, the mine drifts
            if (Math.abs(currentU) > 0.1 || Math.abs(currentV) > 0.1) {
                
                // Accumulate drift internally so it only jumps whole tiles
                (unit as any).driftAccumX = ((unit as any).driftAccumX || 0) + currentU * 0.1;
                (unit as any).driftAccumY = ((unit as any).driftAccumY || 0) + currentV * 0.1;

                if (Math.abs((unit as any).driftAccumX) >= 1.0) {
                    unit.x += Math.sign((unit as any).driftAccumX);
                    (unit as any).driftAccumX -= Math.sign((unit as any).driftAccumX);
                }
                
                if (Math.abs((unit as any).driftAccumY) >= 1.0) {
                    unit.y += Math.sign((unit as any).driftAccumY);
                    (unit as any).driftAccumY -= Math.sign((unit as any).driftAccumY);
                }

                // If it hits land, it detonates uselessly
                const tileCost = terrainMap.getBaseCost(unit.y * terrainMap.width + unit.x);
                if (tileCost < 200) {
                    unit.hp = 0; // Destroyed on the beach
                }
            }
        }
    }
}