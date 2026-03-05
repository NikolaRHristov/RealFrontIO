import { UnitImpl } from './UnitImpl';
import { TerrainSearchMap } from './TerrainSearchMap';
import { PlayerImpl } from './PlayerImpl';

export class MoraleManager {
    public static sanctionedPlayers: Set<string> = new Set();

    public static setSanctionStatus(playerId: string, isSanctioned: boolean) {
        if (isSanctioned) this.sanctionedPlayers.add(playerId);
        else this.sanctionedPlayers.delete(playerId);
    }

    /**
     * Psychological Warfare Engine.
     * Combines global economic data (SWIFT) with local WGS84 data (ACLED Protests).
     */
    public static processMorale(units: UnitImpl[], terrainMap: TerrainSearchMap, players: Map<string, PlayerImpl>) {
        for (const unit of units) {
            let moraleDecay = 0.0;

            // 1. Non-Spatial Global Threat: SWIFT Sanctions
            if (this.sanctionedPlayers.has(unit.ownerId)) {
                // If a nation is cut off from global finance, troop morale plummets
                moraleDecay += 0.5;
            }

            // 2. Spatial Local Threat: ACLED Civil Unrest
            // Channel 7 maps to riots and protests
            const vector = terrainMap.getHazardVector(unit.x, unit.y);
            const civilUnrest = vector[7];
            
            if (civilUnrest > 0.4) {
                // Standing in a rioting city degrades military cohesion
                moraleDecay += (civilUnrest * 2.0);
            }

            // Apply Decay
            unit.morale -= moraleDecay;

            // Rout Logic: If morale breaks, unit disobeys player commands
            if (unit.morale <= 0 && !unit.isRouted) {
                unit.isRouted = true;
                unit.speed *= 1.5; // Fleeing in panic
                
                // Force command to retreat to nearest friendly city
                const player = players.get(unit.ownerId);
                if (player && player.cities.length > 0) {
                    unit.currentCommand = { type: 'MOVE', targetX: player.cities[0].x, targetY: player.cities[0].y };
                }
            }

            // Passive recovery if not in combat and not in a riot
            if (moraleDecay === 0 && unit.morale < unit.maxMorale) {
                unit.morale += 0.1;
                if (unit.morale > 20) unit.isRouted = false; // Rallied
            }
        }
    }
}