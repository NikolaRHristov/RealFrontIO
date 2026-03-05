import { PlayerImpl } from './PlayerImpl';
import { TechNode, TechTreeManager } from './TechTreeManager';
import { GameImpl } from './GameImpl';

export class DeadHandProtocol {
    /**
     * If a player's Capital City is captured or destroyed, and they possess the ICBM_PROTOCOL tech,
     * the system automatically launches automated nuclear strikes against all enemy capitals.
     */
    public static evaluateCapitalLoss(player: PlayerImpl, game: GameImpl) {
        // Assuming the first city in the array is the Capital
        const capital = player.cities[0];
        
        if (!capital || (capital as any).isDestroyed) {
            
            if (TechTreeManager.hasTech(player, TechNode.ICBM_PROTOCOL)) {
                console.warn(`[DEAD HAND] Player ${player.id}'s Capital fell. Initiating automated retaliation.`);
                
                // Identify all hostile players
                const enemies = game.getPlayers().filter(p => p.id !== player.id);
                
                for (const enemy of enemies) {
                    const enemyCapital = enemy.cities[0];
                    if (enemyCapital && !(enemyCapital as any).isDestroyed) {
                        this.launchRetaliationStrike(enemyCapital.x, enemyCapital.y, game);
                    }
                }
            }
        }
    }

    private static launchRetaliationStrike(targetX: number, targetY: number, game: GameImpl) {
        console.warn(`[ICBM LAUNCH] Trajectory locked on ${targetX},${targetY}`);
        // In the next tick, the CyberWarfareManager (from earlier batches) 
        // will handle the detonation, radiation fallout, and permanent HP destruction.
        (game as any).pendingNuclearStrikes.push({ x: targetX, y: targetY, timer: 300 }); // 5 seconds to impact
    }
}