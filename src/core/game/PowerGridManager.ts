import { PlayerImpl, City } from './PlayerImpl';

export class PowerGridManager {
    /**
     * If a city's power plant is destroyed (or a real-world ENTSO-E blackout occurs),
     * the blackout cascades across connected cities via the road network.
     */
    public static propagateBlackouts(players: PlayerImpl[], gameMap: any) {
        for (const player of players) {
            
            // Step 1: Identify origin point blackouts
            const blackedOutCities = new Set<City>();
            for (const city of player.cities) {
                if ((city as any).powerGridDestroyed) {
                    blackedOutCities.add(city);
                }
            }

            // Step 2: Cellular Automata Cascade
            // If City A is blacked out, and City B is connected via road, City B loses power.
            for (const city of player.cities) {
                if (blackedOutCities.has(city)) {
                    // Shut down production queues
                    city.baseIncome = 0;
                    
                    // In a full implementation, we run A* from this city to all other cities owned by the player.
                    // If a continuous road exists, the linked city also gets added to the blackout set for the next tick.
                }
            }
        }
    }
}