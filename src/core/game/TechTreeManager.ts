import { PlayerImpl } from './PlayerImpl';

export enum TechNode {
    ICBM_PROTOCOL = 'ICBM_PROTOCOL',
    FARADAY_CAGES = 'FARADAY_CAGES',
    NBC_SEALS = 'NBC_SEALS', // Nuclear/Biological/Chemical
    STEALTH_COATING = 'STEALTH_COATING'
}

export class TechTreeManager {
    /**
     * Handles the unlocking of technologies that provide immunity to
     * real-world OSINT anomalies.
     */
    public static researchTech(player: PlayerImpl, tech: TechNode) {
        const researchCost = 5000; // Requires massive treasury

        if (player.money >= researchCost && !player.unlockedTechs.has(tech)) {
            player.money -= researchCost;
            player.unlockedTechs.add(tech);
            console.log(`[TECH] Player ${player.id} researched ${tech}`);
        }
    }

    public static hasTech(player: PlayerImpl, tech: TechNode): boolean {
        return player.unlockedTechs.has(tech);
    }
}

// ==========================================
// Patching BioSpaceManager to respect the Tech Tree
// ==========================================
import { BioSpaceManager } from './BioSpaceManager';
import { TerrainSearchMap } from './TerrainSearchMap';

export class AdvancedBioSpaceManager extends BioSpaceManager {
    public static resolveHazardsWithTech(units: UnitImpl[], terrainMap: TerrainSearchMap, spaceWeatherSeverity: number, players: Map<string, PlayerImpl>) {
        const isGeomagneticStorm = spaceWeatherSeverity > 0.7;

        for (const unit of units) {
            const player = players.get(unit.ownerId);
            if (!player) continue;

            // 1. SPACE WEATHER (EMP) vs FARADAY CAGES
            if (isGeomagneticStorm) {
                if (!TechTreeManager.hasTech(player, TechNode.FARADAY_CAGES)) {
                    if (unit.type === 'AIRCRAFT' || unit.type === 'DRONE') unit.hp -= 5.0;
                    if (unit.type === 'RADAR') (unit as any).visionRange = 2;
                }
            }

            // 2. BIOLOGICAL/CHEMICAL vs NBC SEALS
            const bioHazard = terrainMap.getHazardVector(unit.x, unit.y)[14];
            if (bioHazard > 0.2) {
                if (unit.type === 'INFANTRY' && !TechTreeManager.hasTech(player, TechNode.NBC_SEALS)) {
                    (unit as any).isInfected = true;
                }
            }
        }
    }
}