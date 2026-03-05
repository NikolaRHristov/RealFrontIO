import { TerrainSearchMap } from './TerrainSearchMap';
import { UnitImpl } from './UnitImpl';

export class ThermalSignatureManager {
    /**
     * Projects the heat signatures of units into the SharedArrayBuffer's
     * Channel 1 (Fire/Thermal) so the FLIR WebGL shader can render them.
     */
    public static updateThermalGrid(units: UnitImpl[], terrainMap: TerrainSearchMap) {
        // Clear the thermal channel of unit heat (NASA wildfires persist via a different loop)
        // ... (Clear loop omitted for brevity) ...

        for (const unit of units) {
            const index = ((unit.y * terrainMap.width) + unit.x) * 16 + 1; // Channel 1

            // Infantry generate tiny body heat (0.2)
            // Massive tank diesel engines generate blinding white heat (0.8)
            let heatSignature = 0.2;
            if (unit.type === 'ARMOR') heatSignature = 0.8;
            if (unit.type === 'NAVAL') heatSignature = 0.9;
            
            // If the unit recently fired its weapons, the barrel heat spikes to 1.0
            if (unit.ticksSinceLastFire < 50) {
                heatSignature = 1.0; 
            }

            terrainMap.globalStateVectors[index] = Math.max(
                terrainMap.globalStateVectors[index], 
                heatSignature
            );
        }
    }
}