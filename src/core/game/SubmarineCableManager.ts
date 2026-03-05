import { UnitImpl } from './UnitImpl';
import { TerrainSearchMap } from './TerrainSearchMap';

export class SubmarineCableManager {
    /**
     * Counter-play to the NetBlocks BGP Hijacking (Channel 2).
     * Naval Engineers can be deployed to coastal or deep water tiles to "splice"
     * severed underwater internet cables, forcibly restoring the minimap UI.
     */
    public static attemptCableSplice(engineer: UnitImpl, terrainMap: TerrainSearchMap) {
        if (engineer.type !== 'NAVAL_ENGINEER') return;

        const currentCyberSeverity = terrainMap.getHazardVector(engineer.x, engineer.y)[2];

        if (currentCyberSeverity > 0.0) {
            // Engineer reduces the local BGP anomaly (healing the network)
            const newSeverity = Math.max(0.0, currentCyberSeverity - 0.2);
            terrainMap.setHazardChannel(engineer.x, engineer.y, 2, newSeverity);

            console.log(`[CYBERCOM] Naval Engineer at ${engineer.x},${engineer.y} splicing submarine cables. Connectivity improving.`);
        }
    }
}