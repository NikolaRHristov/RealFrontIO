import { GameImpl } from './GameImpl';
import { PlayerImpl } from './PlayerImpl';
import { GlobalEventTicker } from '../../client/ui/GlobalEventTicker';

export class SpymasterEconAI {
    /**
     * The Spymaster AI (Rust-backed) acts as the ultimate balancing force.
     * If a single player is monopolizing the Polymarket Arbitrage system (Batch 79)
     * and hoarding too much wealth, the AI intervenes by triggering a localized
     * market crash, destroying their stored capital.
     */
    public static auditPlayerWealth(game: GameImpl) {
        const players = game.getPlayers();
        
        let totalGlobalWealth = 0;
        players.forEach(p => totalGlobalWealth += p.money);

        if (totalGlobalWealth === 0) return;

        for (const player of players) {
            // If a player controls more than 60% of the entire globe's liquid capital
            if (player.money / totalGlobalWealth > 0.6) {
                
                // The Black Swan AI strikes
                const lostCapital = Math.floor(player.money * 0.4); // Burn 40% of their cash
                player.money -= lostCapital;

                console.warn(`[SPYMASTER] Player ${player.id} monopolized the market. Initiating flash crash.`);
                
                GlobalEventTicker.prototype.pushEvent(
                    "BLACK_SWAN", 
                    `MARKET MANIPULATION DETECTED. FACTION [${player.id}] SUFFERS DEVASTATING FLASH CRASH. LOSES ${lostCapital} CAPITAL.`
                );
            }
        }
    }
}