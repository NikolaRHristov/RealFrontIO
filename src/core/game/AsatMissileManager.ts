import { TerrainSearchMap } from './TerrainSearchMap';
import { PlayerImpl } from './PlayerImpl';
import { GameImpl } from './GameImpl';

export class AsatMissileManager {
    /**
     * Anti-Satellite (ASAT) Warfare.
     * Players can launch kinetic kill vehicles to physically destroy orbital infrastructure.
     * This forcibly spikes Channel 3 (Orbital/GPS Degradation) to 1.0 in a massive radius.
     */
    public static executeAsatStrike(targetX: number, targetY: number, player: PlayerImpl, terrainMap: TerrainSearchMap, game: GameImpl) {
        // ASAT missiles cost an immense amount of capital
        if (player.money < 5000) return;
        player.money -= 5000;

        console.warn(`[STRATCOM] ASAT Missile launched by Player ${player.id} aiming for LEO above [${targetX}, ${targetY}]`);

        // Calculate a massive cone of GPS destruction (e.g. 50 tile radius)
        const radius = 50;

        for (let y = Math.floor(targetY - radius); y <= Math.ceil(targetY + radius); y++) {
            for (let x = Math.floor(targetX - radius); x <= Math.ceil(targetX + radius); x++) {
                if (x >= 0 && x < terrainMap.width && y >= 0 && y < terrainMap.height) {
                    const dist = Math.hypot(x - targetX, y - targetY);
                    if (dist <= radius) {
                        // Force the GPS degradation to maximum
                        terrainMap.setHazardChannel(x, y, 3, 1.0);
                    }
                }
            }
        }

        // Alert the Kessler Syndrome Manager that the debris field just expanded massively
        // (Handled automatically on the next tick by Batch 70)
    }
}