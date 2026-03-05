import { UnitImpl, UnitType } from './UnitImpl';

export class AircraftCarrierManager {
    /**
     * Carriers act as mobile cities.
     * They have their own internal hangar capacity and production queues.
     * Aircraft can launch from, and must return to, the carrier's exact (moving) x,y coordinates.
     */
    public static processCarrierQueues(carriers: UnitImpl[]) {
        for (const carrier of carriers) {
            if (carrier.type !== 'AIRCRAFT_CARRIER') continue;

            const queue = (carrier as any).productionQueue || [];
            
            if (queue.length > 0) {
                const currentJob = queue[0];
                currentJob.progress += 1;

                if (currentJob.progress >= 100) {
                    queue.shift();
                    console.log(`[NAVAL AVIATION] Carrier ${carrier.id} completed construction of ${currentJob.unitType}.`);
                    
                    // Add to the carrier's internal hangar array
                    if (!(carrier as any).hangar) (carrier as any).hangar = [];
                    (carrier as any).hangar.push(currentJob.unitType);
                }
            }
        }
    }

    public static launchSortie(carrier: UnitImpl, targetX: number, targetY: number): UnitImpl | null {
        if (carrier.type !== 'AIRCRAFT_CARRIER' || !(carrier as any).hangar || (carrier as any).hangar.length === 0) {
            return null;
        }

        // Pop an aircraft from the hangar
        const typeToLaunch = (carrier as any).hangar.pop();
        
        // Spawn the physical unit on the map at the carrier's location
        const sortie = new UnitImpl(`SORTIE_${Date.now()}`, carrier.ownerId, typeToLaunch, carrier.x, carrier.y);
        
        // Give it an attack/move order
        (sortie as any).movementQueue = [{ x: targetX, y: targetY }];
        (sortie as any).homeBaseId = carrier.id; // It must return here before fuel runs out

        return sortie;
    }
}