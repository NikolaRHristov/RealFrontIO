import { ExchangeManager, ShortPosition } from './ExchangeManager';
import { GameImpl } from './GameImpl';

export class AdvancedExchangeManager extends ExchangeManager {
    /**
     * Overrides the base stepMarket to add cascading Short Squeeze logic.
     */
    public static stepMarketWithSqueeze(game: GameImpl, currentTick: number, terrainMap: any) {
        // Run base calculation
        super.stepMarket(game, currentTick, terrainMap);

        // Check for Short Squeezes
        for (let i = this.openShorts.length - 1; i >= 0; i--) {
            const position = this.openShorts[i];
            
            const targetPlayer = game.getPlayer(position.targetPlayerId);
            if (!targetPlayer) continue;

            const currentValuation = this.calculatePlayerValuation(targetPlayer as any, terrainMap);

            // If the target player's valuation goes UP by 200% instead of crashing,
            // the shorter gets "Squeezed" and is forcefully liquidated.
            if (currentValuation > position.strikeValuation * 2.0) {
                const shorter = game.getPlayer(position.shortingPlayerId);
                if (shorter) {
                    console.warn(`[EXCHANGE] SHORT SQUEEZE TRIGGERED! Player ${shorter.id} is being liquidated!`);
                    
                    // The shorter is fined an additional penalty equal to their initial margin
                    shorter.money -= position.marginCommitted; 
                    
                    // The target player is awarded the margin as a massive cash injection
                    targetPlayer.money += position.marginCommitted;
                }
                
                // Force close the position early
                this.openShorts.splice(i, 1);
            }
        }
    }
}