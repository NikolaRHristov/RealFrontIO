import { TerrainSearchMap } from './TerrainSearchMap';
import { UnitImpl } from './UnitImpl';

export class NavalStealthManager {
    /**
     * Oceanic anomalies (Algae Blooms, Temperature Inversions) create Sonar "Thermoclines".
     * If a Submarine hides in one of these WGS84 tiles, it is completely invisible to enemy radar.
     * We map this to the Biological Channel (14) over water tiles.
     */
    public static applyThermoclineStealth(units: UnitImpl[], terrainMap: TerrainSearchMap) {
        for (const unit of units) {
            if (unit.type !== 'NAVAL') continue; // Assumes some naval units have a 'submarine' subtype in logic

            const tileCost = terrainMap.getBaseCost(unit.y * terrainMap.width + unit.x);
            if (tileCost !== 255) continue; // Must be deep water

            const bioToxicity = terrainMap.getHazardVector(unit.x, unit.y)[14];

            if (bioToxicity > 0.3) {
                // The water is so thick with bio-matter that sonar pings bounce off it.
                (unit as any).isStealthed = true;
            } else {
                (unit as any).isStealthed = false;
            }
        }
    }
}