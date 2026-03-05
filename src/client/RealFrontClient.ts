import { GameView } from './GameView';
import { HazardLensFilter } from '../render/HazardLensFilter';
import { ClientSocketHandler } from '../network/ClientSocketHandler';
import { TerrainSearchMap } from '../../core/game/TerrainSearchMap';

export class RealFrontClient {
    public hazardFilter: HazardLensFilter;
    public socketHandler: ClientSocketHandler;

    constructor(
        private gameView: GameView, 
        private terrainMap: TerrainSearchMap
    ) {
        // 1. Mount the Brutalist WebGL Shader onto the GameView's main PIXI map container
        this.hazardFilter = new HazardLensFilter(
            terrainMap.width, 
            terrainMap.height, 
            terrainMap.memoryBuffer
        );
        
        if ((this.gameView as any).mapContainer) {
            (this.gameView as any).mapContainer.filters = [this.hazardFilter];
        }

        // 2. Initialize the Late-Join Binary WebSocket Hydration
        this.socketHandler = new ClientSocketHandler(terrainMap.memoryBuffer);
    }

    /**
     * Switches the active intelligence lens (Physical, Cyber, Economic)
     */
    public switchLens(lensId: number) {
        this.hazardFilter.setActiveLens(lensId);
    }
}