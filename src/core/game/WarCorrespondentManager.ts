import { UnitImpl } from './UnitImpl';
import { DiplomacyManager } from './DiplomacyManager';
import { GlobalEventTicker } from '../../client/ui/GlobalEventTicker';
import { DefconManager } from './DefconManager';

export class WarCorrespondentManager {
    /**
     * Embedded Press Units.
     * Unarmed, neutral (or player-owned) units with a camera.
     * If they witness a War Crime (e.g. killing refugees, executing POWs), 
     * they instantly broadcast it to the global UI, crashing the perpetrator's morale.
     */
    public static witnessEvent(pressUnit: UnitImpl, eventX: number, eventY: number, perpetratorId: string, eventType: string) {
        if (pressUnit.type !== 'PRESS') return;

        const dist = Math.hypot(pressUnit.x - eventX, pressUnit.y - eventY);
        const visionRange = 10; // High zoom camera lens

        if (dist <= visionRange) {
            console.warn(`[MEDIA] Press Unit ${pressUnit.id} caught ${perpetratorId} committing ${eventType} on camera!`);
            
            // Broadcast to the entire server
            GlobalEventTicker.prototype.pushEvent(
                "GLOBAL_NEWS_NETWORK", 
                `BREAKING: LEAKED FOOTAGE SHOWS FACTION [${perpetratorId}] COMMITTING WAR CRIMES. GLOBAL CONDEMNATION IMMINENT.`
            );

            // Mechanically punish the perpetrator
            DiplomacyManager.enforceSanction(perpetratorId, "GLOBAL_OUTRAGE");
            
            // Spike the global DEFCON tension
            DefconManager.evaluateGlobalTension(1000, 1.0, 0); // Simulate massive unrest
        }
    }
}