import { GameImpl } from './GameImpl';
import { PlayerImpl } from './PlayerImpl';

export class DefconManager {
    public static currentDefcon: number = 5;

    /**
     * Receives the parsed DEFCON integer from the Rust gRPC stream
     */
    public static updateDefconState(newLevel: number, game: GameImpl) {
        if (this.currentDefcon === newLevel) return;

        console.warn(`[DEFCON] Global Threat Level shifted to DEFCON ${newLevel}`);
        this.currentDefcon = newLevel;

        // Broadcast the terrifying UI alert to all players
        game.broadcastToPlayers({
            type: 'DEFCON_ALERT',
            level: newLevel,
            message: this.getDefconMessage(newLevel)
        });

        // Apply fundamental engine rule changes based on DEFCON
        this.applyRulesOfEngagement(game.getPlayers());
    }

    private static getDefconMessage(level: number): string {
        switch(level) {
            case 1: return "NUCLEAR RELEASE AUTHORIZED. MAXIMUM FORCE REQUIRED.";
            case 2: return "ARMED FORCES AT MAXIMUM READINESS. MOBILIZATION COSTS HALVED.";
            case 3: return "FORCE READINESS INCREASED. LOGISTICS NETWORKS OVERDRIVEN.";
            case 4: return "ABOVE NORMAL INTELLIGENCE GATHERING.";
            case 5: return "NORMAL PEACETIME READINESS.";
            default: return "";
        }
    }

    private static applyRulesOfEngagement(players: PlayerImpl[]) {
        for (const player of players) {
            switch(this.currentDefcon) {
                case 1:
                    // DEFCON 1: The Apocalypse
                    // Nuclear silos are unlocked. Missiles are instantly built.
                    player.unlockTech('ICBM_PROTOCOL');
                    player.productionMultiplier = 5.0; // Desperation manufacturing
                    break;
                case 2:
                    // DEFCON 2: Brinksmanship
                    // Tanks and hardware are 50% cheaper
                    player.unitCostMultiplier = 0.5;
                    player.productionMultiplier = 2.0;
                    break;
                case 3:
                    // DEFCON 3: Accelerated Logistics
                    // Troops move 25% faster
                    player.movementSpeedMultiplier = 1.25;
                    break;
                case 5:
                    // Back to normal
                    player.unitCostMultiplier = 1.0;
                    player.movementSpeedMultiplier = 1.0;
                    player.productionMultiplier = 1.0;
                    player.lockTech('ICBM_PROTOCOL'); // Relock nukes
                    break;
            }
        }
    }
}