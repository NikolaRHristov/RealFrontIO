import { GameMode } from './Lobby';
import { GameRunner } from './GameRunner';
import { TerrainSearchMap } from './TerrainSearchMap';
import { SeismicManager } from './SeismicManager';
import { EcologicalManager } from './EcologicalManager';
import { CyberWarfareManager } from './CyberWarfareManager';
import { GameImpl } from './GameImpl';

export class RealFrontAdapter {
    private grpcClient: any;
    private gameRunner: GameRunner;
    private terrainMap: TerrainSearchMap;
    private game: GameImpl;

    constructor(grpcClient: any, gameRunner: GameRunner, terrainMap: TerrainSearchMap, game: GameImpl) {
        this.grpcClient = grpcClient;
        this.gameRunner = gameRunner;
        this.terrainMap = terrainMap;
        this.game = game;
    }

    public async initializeGrpcStream(mode: GameMode, historicalConfig?: any) {
        if (mode === GameMode.LIVE_INTELLIGENCE) {
            this.grpcClient.SubscribeToWorldEvents({ server_id: "Node-1", current_tick: 0 })
                .on('data', (batch: any) => this.gameRunner.queueWorldEvents(batch));
        } else if (mode === GameMode.HISTORICAL && historicalConfig) {
            console.log(`[REALFRONT] Booting Historical Scenario starting at ${new Date(historicalConfig.startMs).toISOString()}`);
            this.grpcClient.SubscribeToHistoricalEvents({
                server_id: "Node-1",
                start_epoch_ms: historicalConfig.startMs,
                end_epoch_ms: historicalConfig.endMs,
                playback_speed_multiplier: historicalConfig.speed 
            }).on('data', (batch: any) => {
                this.gameRunner.queueWorldEvents(batch);
            });
        }
    }

    public onTick(currentTick: number) {
        const tickEvents = this.gameRunner.getBufferedEvents(currentTick);
        if (tickEvents) {
            for (const event of tickEvents) {
                switch(event.category) {
                    case 'HAZARD_EARTHQUAKE':
                        SeismicManager.resolveTectonicDeformation(
                            event.center_x, event.center_y, 
                            event.severity, event.radius, 
                            this.terrainMap, this.game.map, this.game
                        );
                        break;
                    case 'HAZARD_WILDFIRE':
                        // Assuming EcologicalManager exists from earlier batches
                        if (EcologicalManager) EcologicalManager.applyWildfire(event, this.terrainMap, this.game.map);
                        break;
                    case 'HAZARD_CYBER_ATTACK':
                        CyberWarfareManager.handleMissileDetonation(event.center_x, event.center_y, this.game, this.terrainMap);
                        break;
                }
            }
        }
    }
}