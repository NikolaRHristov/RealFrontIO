import { UnitImpl } from './UnitImpl';
import { GameImpl } from './GameImpl';
import { GlobalEventTicker } from '../../client/ui/GlobalEventTicker';

export interface SubseaPipeline {
    id: string;
    path: {x: number, y: number}[];
    isActive: boolean;
    fuelThroughput: number;
}

export class PipelineSabotageManager {
    public static globalPipelines: SubseaPipeline[] = [];

    /**
     * Deep-sea submersibles can locate and detonate invisible global pipelines.
     * This instantly cuts fuel logistics to entire continents and crashes the economy.
     */
    public static executeSabotage(sub: UnitImpl, game: GameImpl) {
        if (sub.type !== 'SUBMERSIBLE') return;

        for (const pipe of this.globalPipelines) {
            if (!pipe.isActive) continue;

            for (const node of pipe.path) {
                const dist = Math.hypot(sub.x - node.x, sub.y - node.y);
                if (dist <= 1.0) { // Must be right on top of it
                    
                    pipe.isActive = false;
                    
                    // Detonate the submersible to destroy the pipe
                    sub.hp = 0; 

                    console.warn(`[BLACK OPS] Subsea Pipeline ${pipe.id} detonated!`);
                    
                    GlobalEventTicker.prototype.pushEvent(
                        "ECO_TERRORISM", 
                        `MAJOR SUBSEA PIPELINE RUPTURED AT [${node.x}, ${node.y}]. GLOBAL FUEL PRICES SPIKING.`
                    );

                    // All players lose a massive chunk of their global fuel regeneration
                    const players = game.getPlayers();
                    for (const p of players) {
                        (p as any).globalFuelRegen -= pipe.fuelThroughput;
                    }

                    return;
                }
            }
        }
    }
}