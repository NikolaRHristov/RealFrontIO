import { PlayerImpl, City } from './PlayerImpl';
import { UnitImpl } from './UnitImpl';

export class StuxnetManager {
    /**
     * Advanced Cyber Sabotage.
     * A Spy can infect an enemy factory with a Stuxnet-like worm.
     * The worm physically alters the server state, but the UI lies to the victim.
     */
    public static infectFactory(spy: UnitImpl, targetCity: City) {
        if (spy.type !== 'SPY') return;

        const dist = Math.hypot(spy.x - targetCity.x, spy.y - targetCity.y);
        
        if (dist <= 1.0) {
            (targetCity as any).isStuxnetInfected = true;
            console.log(`[CYBER] Spy ${spy.id} successfully injected Stuxnet into Factory ${targetCity.id}.`);
            // Spy is consumed/extracted after operation
            spy.hp = 0; 
        }
    }

    public static processProductionSabotage(player: PlayerImpl) {
        for (const city of player.cities) {
            if ((city as any).isStuxnetInfected) {
                // If the factory is currently building a unit
                if ((city as any).productionQueue && (city as any).productionQueue.length > 0) {
                    
                    const currentJob = (city as any).productionQueue[0];
                    
                    // The factory continues to drain money from the player's account
                    player.money -= currentJob.costPerTick;
                    
                    // The progress bar moves up...
                    currentJob.progress += 1;

                    // But when it hits 100%, the server quietly deletes the unit instead of spawning it.
                    if (currentJob.progress >= 100) {
                        (city as any).productionQueue.shift();
                        console.warn(`[STUXNET] Factory ${city.id} finished production, but the hardware was bricked by malware. Unit deleted.`);
                        
                        // The player's UI will just show the unit "disappearing" from the queue,
                        // causing massive confusion and forcing them to investigate their own base.
                    }
                }
            }
        }
    }
}