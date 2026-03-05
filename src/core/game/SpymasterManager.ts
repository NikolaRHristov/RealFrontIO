import { TerrainSearchMap } from './TerrainSearchMap';
import { GameImpl } from './GameImpl';

export class IntelligenceObjective {
    public id: string;
    public x: number;
    public y: number;
    public captureProgress: number = 0;
    public owningPlayerId: string | null = null;
    
    constructor(id: string, x: number, y: number) {
        this.id = id;
        this.x = x;
        this.y = y;
    }
}

export class SpymasterManager {
    public static activeObjectives: Map<string, IntelligenceObjective> = new Map();

    /**
     * Receives Anomaly Reports from the Rust Spymaster AI via gRPC.
     * Spawns physical "Capture Points" on the game map.
     */
    public static handleAnomalyReport(report: any, game: GameImpl) {
        // If an objective already exists here, ignore.
        if (this.activeObjectives.has(report.anomaly_id)) return;

        console.warn(`[SPYMASTER] Black Swan Anomaly Detected at ${report.center_x},${report.center_y}! Deploying Intelligence Objective.`);

        const objective = new IntelligenceObjective(
            report.anomaly_id, 
            report.center_x, 
            report.center_y
        );
        
        this.activeObjectives.set(report.anomaly_id, objective);
        
        // Broadcast to all connected WebSockets so players see the alert on their minimap
        game.broadcastToPlayers({
            type: 'SYSTEM_ALERT',
            message: 'A massive intelligence anomaly has been detected. Capture the sector to secure Black-Ops funding.',
            x: report.center_x,
            y: report.center_y
        });
    }

    /**
     * Evaluates if any player's infantry is standing on the objective.
     * Called every game tick.
     */
    public static processCapturePoints(game: GameImpl) {
        for (const [id, obj] of this.activeObjectives.entries()) {
            const unitsOnPoint = game.getUnitsAt(obj.x, obj.y);
            
            // Only Infantry can capture intelligence
            const capturingUnit = unitsOnPoint.find(u => u.type === 'INFANTRY');

            if (capturingUnit) {
                obj.captureProgress += 1; // Takes ~100 ticks to capture

                if (obj.captureProgress >= 100) {
                    obj.owningPlayerId = capturingUnit.ownerId;
                    this.rewardPlayer(capturingUnit.ownerId, game);
                    this.activeObjectives.delete(id); // Remove from map
                }
            } else {
                // Progress decays if left unattended
                obj.captureProgress = Math.max(0, obj.captureProgress - 0.5);
            }
        }
    }

    private static rewardPlayer(playerId: string, game: GameImpl) {
        const player = game.getPlayer(playerId);
        if (player) {
            console.log(`[SPYMASTER] Player ${playerId} secured the Black Swan data!`);
            // Massive resource injection representing seized geopolitical assets
            player.money += 10000; 
            
            // Unlock a temporary tech-tree boost (e.g., Radar immunity)
            player.unlockBlackOpsTech(); 
        }
    }
}