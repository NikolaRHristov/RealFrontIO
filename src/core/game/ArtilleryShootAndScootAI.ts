import { UnitImpl } from './UnitImpl';

export class ArtilleryShootAndScootAI {
    /**
     * Counter-Battery survival logic.
     * When mobile artillery fires, they immediately emit a triangulation signal (Batch 53).
     * To survive the inevitable counter-barrage, the AI automatically forces the unit
     * to pathfind to a new location 3-5 tiles away.
     */
    public static processDisplacement(artillery: UnitImpl) {
        if (artillery.type !== 'MOBILE_ARTILLERY') return;

        // If the unit just fired its weapon this tick
        if ((artillery as any).justFired) {
            console.log(`[AI] Mobile Artillery ${artillery.id} executing Shoot-and-Scoot displacement.`);
            
            // Pick a random displacement vector (simplified, assuming clear terrain for now)
            // In the full engine, this would interface with the A* queue
            const angle = Math.random() * Math.PI * 2;
            const distance = 4; // Move 4 tiles away

            const newX = Math.floor(artillery.x + Math.cos(angle) * distance);
            const newY = Math.floor(artillery.y + Math.sin(angle) * distance);

            // Force the movement command queue
            (artillery as any).movementQueue = [{ x: newX, y: newY }];
            
            // Reset the firing flag
            (artillery as any).justFired = false;
        }
    }
}