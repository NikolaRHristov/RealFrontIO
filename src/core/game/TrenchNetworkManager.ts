import { UnitImpl } from './UnitImpl';
import { TerrainSearchMap } from './TerrainSearchMap';

export class TrenchNetworkManager {
    /**
     * Infantry can be ordered to "Dig In".
     * After 60 seconds (600 ticks), they permanently alter the terrain tile,
     * converting it into a TRENCH biome that grants near-invulnerability to small arms.
     */
    public static processDigging(infantry: UnitImpl, terrainMap: TerrainSearchMap) {
        if (infantry.type !== 'INFANTRY') return;

        if ((infantry as any).isDiggingIn) {
            (infantry as any).digProgress = ((infantry as any).digProgress || 0) + 1;

            if ((infantry as any).digProgress >= 600) {
                // Dig complete
                (infantry as any).isDiggingIn = false;
                (infantry as any).digProgress = 0;

                // Permanently alter the map tile
                terrainMap.setBiome(Math.floor(infantry.x), Math.floor(infantry.y), 'TRENCH');
                console.log(`[ENGINEERING] Trench network established at [${Math.floor(infantry.x)}, ${Math.floor(infantry.y)}].`);
            }
        }
    }

    public static calculateTrenchDefense(defender: UnitImpl, weaponType: string, terrainMap: TerrainSearchMap): number {
        const biome = terrainMap.getBiome(Math.floor(defender.x), Math.floor(defender.y));
        
        if (biome === 'TRENCH' && defender.type === 'INFANTRY') {
            // Trenches offer near total immunity to bullets
            if (weaponType === 'SMALL_ARMS') return 0.1; // 90% reduction
            
            // However, they are death traps against flamethrowers or direct artillery hits
            if (weaponType === 'FLAMETHROWER' || weaponType === 'THERMOBARIC') return 2.0; // 200% damage
        }
        
        return 1.0; // Standard damage multiplier
    }
}