import { GameImpl } from './GameImpl';
import { TerrainSearchMap } from './TerrainSearchMap';
import { GameRunner } from './GameRunner';
import { UnitImpl } from './UnitImpl';

export class RealFrontAdapter {
    public gameRunner: GameRunner;
    public terrainMap: TerrainSearchMap;

    constructor(public game: GameImpl, mapWidth: number, mapHeight: number) {
        // Initialize the 4-Channel SharedArrayBuffer
        this.terrainMap = new TerrainSearchMap(mapWidth, mapHeight);
        
        // Initialize the determinist WGS84 Event Loop
        this.gameRunner = new GameRunner(this.terrainMap);
    }

    /**
     * Should be called at the start of every core game tick in GameImpl.ts
     */
    public onTick() {
        // 1. Process incoming global intelligence streams via gRPC
        this.gameRunner.update();

        // 2. Iterate through all active game units and apply environmental consequences
        const allUnits = this.game.getAllUnits ? this.game.getAllUnits() : [];
        for (const unit of allUnits) {
            this.applyHazardConsequencesToUnit(unit as any);
        }
    }

    private applyHazardConsequencesToUnit(unit: UnitImpl) {
        const hazardVector = this.terrainMap.getHazardVector(unit.x, unit.y);
        const physical = hazardVector[0]; // Earthquakes, storms, warzones
        const cyber = hazardVector[1];    // Blackouts, DDoS

        // Brutalist Mechanic: Physical hazards slowly crush unit HP
        if (physical > 0.8) {
            // Severe damage for standing in an epicenter
            unit.hp -= (physical * 2); 
        }

        // Fog of War / Cyber Blackout: Units lose connection to high command
        if (cyber > 0.6) {
            // Sever the player's ability to issue commands
            (unit as any).isAutonomous = true;
            unit.clearWaypoints(); 
            // Fallback AI: Unit entrenches and waits for internet restoration
            (unit as any).stance = 'DEFENSIVE'; 
        } else {
            (unit as any).isAutonomous = false;
        }
    }
}