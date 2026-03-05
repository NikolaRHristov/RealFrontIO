import { PlayerImpl } from './PlayerImpl';
import { UnitImpl } from './UnitImpl';

export class BlackMarketManager {
    /**
     * Allows players to anonymously sell captured enemy equipment 
     * (e.g. from Boarding Actions in Batch 103) back to the global Polymarket pool.
     */
    public static sellCapturedHardware(player: PlayerImpl, capturedUnit: UnitImpl) {
        // Ensure the unit was actually captured (original owner is not current owner)
        // For simplicity, assuming a flag was set during the Boarding Action or Espionage
        if (!(capturedUnit as any).isCapturedHardware) return;

        // Calculate black market value (e.g., 50% of build cost)
        let value = 0;
        if (capturedUnit.type === 'CARGO_SHIP') value = 1500;
        else if (capturedUnit.type === 'HEAVY_ARMOR') value = 800;

        if (value > 0) {
            player.money += value;
            
            // Delete the physical unit from the map
            capturedUnit.hp = 0; 
            
            console.log(`[BLACK MARKET] Player ${player.id} sold captured ${capturedUnit.type} for ${value} untraceable capital.`);
            
            // Note: Because this uses the Black Market, it does NOT trigger the 
            // SpymasterEconAI (Batch 85) monopoly audit immediately.
        }
    }
}