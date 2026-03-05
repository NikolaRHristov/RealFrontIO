import { PlayerImpl } from './PlayerImpl';
import { TerrainSearchMap } from './TerrainSearchMap';

export class PolymarketArbitrageManager {
    /**
     * Allows players to physically trade in-game currency based on the real-world
     * Polymarket API data (Channel 9). 
     */
    public static executeTrade(player: PlayerImpl, tradeAmount: number, isLong: boolean, terrainMap: TerrainSearchMap, globalX: number, globalY: number) {
        if (player.money < tradeAmount) return;

        // Fetch the local economic volatility index from Channel 9
        const volatilityIndex = terrainMap.getHazardVector(globalX, globalY)[9];
        
        // Very basic mock of an arbitrage loop.
        // If the real-world market is volatile (closer to 1.0), the payout multipliers are huge,
        // but the risk of losing the investment is equal.
        const successChance = isLong ? (1.0 - volatilityIndex) : volatilityIndex;
        
        player.money -= tradeAmount;

        if (Math.random() < successChance) {
            // Success: massive payout based on volatility
            const payout = tradeAmount * (1.0 + volatilityIndex * 2.0);
            player.money += payout;
            console.log(`[ECON] Player ${player.id} executed successful Arbitrage. Netted ${payout}.`);
        } else {
            console.log(`[ECON] Player ${player.id} Arbitrage failed. Investment lost.`);
        }
    }
}