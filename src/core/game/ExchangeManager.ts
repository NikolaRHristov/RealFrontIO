import { PlayerImpl } from './PlayerImpl';
import { GameImpl } from './GameImpl';

export interface ShortPosition {
    shortingPlayerId: string;
    targetPlayerId: string;
    strikeValuation: number; // The target player's net worth when the short was opened
    marginCommitted: number; // How much money the shorter put up
    tickOpened: number;
}

export class ExchangeManager {
    public static openShorts: ShortPosition[] = [];
    public static globalMarketData: Map<string, number[]> = new Map(); // History of valuations

    /**
     * Calculates a player's "National Valuation".
     * Based on raw cash, owned territory, and the WGS84 hazard state of their cities.
     */
    public static calculatePlayerValuation(player: PlayerImpl, terrainMap: any): number {
        let valuation = player.money;
        
        for (const city of player.cities) {
            // Base city value
            let cityVal = city.baseIncome * 100;
            
            // WGS84 Economic/Physical Penalties
            const hazardVector = terrainMap.getHazardVector(city.x, city.y);
            const physicalDestruction = hazardVector[0]; // Earthquake/War damage
            const economicSanction = hazardVector[9];    // Polymarket stress
            const civilUnrest = hazardVector[7];         // ACLED protests

            // If the city is in a warzone or burning down, its stock crashes
            if (physicalDestruction > 0.5) cityVal *= 0.2;
            if (economicSanction > 0.5) cityVal *= 0.5;
            if (civilUnrest > 0.5) cityVal *= 0.1;

            valuation += cityVal;
        }
        
        return Math.floor(valuation);
    }

    /**
     * Called every 500 game ticks to update the Bloomberg-style ticker history
     * and resolve mature short positions.
     */
    public static stepMarket(game: GameImpl, currentTick: number, terrainMap: any) {
        const currentValuations = new Map<string, number>();

        // 1. Update historical charts
        for (const player of game.getPlayers()) {
            const val = this.calculatePlayerValuation(player as any, terrainMap);
            currentValuations.set(player.id, val);
            
            if (!this.globalMarketData.has(player.id)) this.globalMarketData.set(player.id, []);
            this.globalMarketData.get(player.id)!.push(val);
        }

        // 2. Resolve Short Positions (Options expire after 5000 ticks)
        for (let i = this.openShorts.length - 1; i >= 0; i--) {
            const position = this.openShorts[i];
            if (currentTick - position.tickOpened >= 5000) {
                const finalValuation = currentValuations.get(position.targetPlayerId) || 0;
                const shorter = game.getPlayer(position.shortingPlayerId);

                if (!shorter) continue;

                if (finalValuation < position.strikeValuation) {
                    // SUCCESSFUL SHORT: Target player lost value (e.g. they got nuked or hit by an earthquake)
                    const percentDrop = 1.0 - (finalValuation / position.strikeValuation);
                    // Massive leverage multiplier (5x)
                    const profit = Math.floor(position.marginCommitted * percentDrop * 5.0); 
                    shorter.money += (position.marginCommitted + profit);
                    console.log(`[EXCHANGE] Player ${shorter.id} made $${profit} shorting Player ${position.targetPlayerId}!`);
                } else {
                    // FAILED SHORT / SHORT SQUEEZE: Target player grew stronger
                    console.log(`[EXCHANGE] Player ${shorter.id} lost their $${position.marginCommitted} margin on a failed short.`);
                    // Margin is wiped out (already subtracted when position opened)
                }

                this.openShorts.splice(i, 1);
            }
        }
    }

    public static executeShortSell(shorterId: string, targetId: string, margin: number, game: GameImpl, terrainMap: any): boolean {
        const shorter = game.getPlayer(shorterId);
        const target = game.getPlayer(targetId);
        if (!shorter || !target || shorter.money < margin) return false;

        shorter.money -= margin; // Lock up collateral

        this.openShorts.push({
            shortingPlayerId: shorterId,
            targetPlayerId: targetId,
            strikeValuation: this.calculatePlayerValuation(target as any, terrainMap),
            marginCommitted: margin,
            tickOpened: game.getCurrentTick()
        });

        return true;
    }
}