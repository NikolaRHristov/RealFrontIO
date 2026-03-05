import { UnitImpl } from './UnitImpl';
import { TerrainSearchMap } from './TerrainSearchMap';

export class BridgeDemolitionManager {
    /**
     * Combat Engineers can rig a bridge (water tile with road overlay) with C4.
     * The player can manually click a UI button to detonate the charges.
     */
    public static rigBridge(engineer: UnitImpl, terrainMap: TerrainSearchMap) {
        if (engineer.type !== 'ENGINEER') return;

        const tileCost = terrainMap.getBaseCost(engineer.y * terrainMap.width + engineer.x);
        
        // If it's a bridge (cheap A* cost over what should be deep water)
        if (tileCost < 100) {
            (engineer as any).hasRiggedBridgeAt = { x: engineer.x, y: engineer.y };
            console.log(`[ENGINEER] Bridge at ${engineer.x}, ${engineer.y} wired with explosives.`);
        }
    }

    public static detonateBridge(riggedX: number, riggedY: number, units: UnitImpl[], terrainMap: TerrainSearchMap) {
        // 1. Destroy the bridge (Reset A* cost to 255 Impassable Deep Water)
        const index = riggedY * terrainMap.width + riggedX;
        terrainMap.setBaseCost(index, 255);

        // 2. Kill anything currently standing on the bridge
        for (const unit of units) {
            if (Math.floor(unit.x) === riggedX && Math.floor(unit.y) === riggedY) {
                // Instantly destroy tanks that fall into the river
                unit.hp = 0; 
                console.warn(`[TACTICAL] Unit ${unit.id} fell into the river! Bridge demolished.`);
            }
        }
    }
}