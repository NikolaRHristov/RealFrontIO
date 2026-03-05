import { GameMode } from './Lobby';
// ... 

export class RealFrontAdapter {
    // ...
    public async initializeGrpcStream(mode: GameMode, historicalConfig?: any) {
        if (mode === GameMode.LIVE_INTELLIGENCE) {
            // Subscribe to the standard Broadcast stream
            this.grpcClient.SubscribeToWorldEvents({ server_id: "Node-1", current_tick: 0 })
                .on('data', (batch: any) => this.gameRunner.queueWorldEvents(batch));
        } else if (mode === GameMode.HISTORICAL && historicalConfig) {
            // Initiate the Time-Travel stream
            console.log(`[REALFRONT] Booting Historical Scenario starting at ${new Date(historicalConfig.startMs).toISOString()}`);
            
            this.grpcClient.SubscribeToHistoricalEvents({
                server_id: "Node-1",
                start_epoch_ms: historicalConfig.startMs,
                end_epoch_ms: historicalConfig.endMs,
                playback_speed_multiplier: historicalConfig.speed // e.g. 24x to play a day in 1 hour
            }).on('data', (batch: any) => {
                // The GameRunner doesn't know it's historical; it processes 
                // the WGS84 events exactly as if they were live.
                this.gameRunner.queueWorldEvents(batch);
            });
        }
    }
}