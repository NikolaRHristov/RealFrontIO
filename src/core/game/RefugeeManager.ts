import { GameImpl } from './GameImpl';
import { UnitImpl, UnitType } from './UnitImpl';

export class RefugeeManager {
    /**
     * When a city is completely destroyed (by a Tsunami, Earthquake, or Artillery),
     * its population spawns as independent "Refugee" swarms.
     */
    public static spawnRefugeeSwarm(cityX: number, cityY: number, populationLost: number, game: GameImpl) {
        console.warn(`[HUMANITARIAN] City collapsed at ${cityX},${cityY}. Spawning ${populationLost} refugees.`);

        // Create a massive, slow-moving neutral unit representing the convoy
        const swarm = new UnitImpl(
            `REFUGEE_${Date.now()}`,
            "NEUTRAL_CIVILIAN",
            UnitType.INFANTRY, // Uses infantry pathing
            cityX, cityY
        );

        // Refugees move extremely slowly
        swarm.speed = 0.5;
        // They have massive HP, simulating the political cost of trying to shoot through them
        swarm.maxHp = 1000;
        swarm.hp = 1000;
        (swarm as any).isRefugee = true;

        // Command them to blindly pathfind to the nearest intact city on the map,
        // regardless of who owns it. This CLOGS the road networks.
        let closestCity = null;
        let minDist = Infinity;
        for (const p of game.getPlayers()) {
            for (const c of p.cities) {
                const dist = Math.sqrt(Math.pow(c.x - cityX, 2) + Math.pow(c.y - cityY, 2));
                if (dist > 0 && dist < minDist) {
                    minDist = dist;
                    closestCity = c;
                }
            }
        }

        if (closestCity) {
            swarm.currentCommand = { type: 'MOVE', targetX: closestCity.x, targetY: closestCity.y };
        }

        game.addUnit(swarm);
    }
}