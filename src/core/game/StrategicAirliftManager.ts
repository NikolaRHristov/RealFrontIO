import { City } from './PlayerImpl';

export interface AirRoute {
    fromCityId: string;
    toCityId: string;
    isActive: boolean;
}

export class StrategicAirliftManager {
    public static globalRoutes: AirRoute[] = [];

    /**
     * If an airport's runway is hit by artillery, the global cargo web instantly reroutes.
     * This creates a dynamic, invisible graph above the ground map.
     */
    public static recalculateAirBridge(cities: City[]) {
        this.globalRoutes = [];

        for (let i = 0; i < cities.length; i++) {
            const cityA = cities[i];
            
            // If city A has an intact airport
            if ((cityA as any).hasAirport && !(cityA as any).airportCratered) {
                for (let j = i + 1; j < cities.length; j++) {
                    const cityB = cities[j];
                    
                    if ((cityB as any).hasAirport && !(cityB as any).airportCratered) {
                        // Establish a valid air bridge
                        this.globalRoutes.push({
                            fromCityId: cityA.id,
                            toCityId: cityB.id,
                            isActive: true
                        });
                        
                        // Cities share resources across this bridge
                        const totalResources = cityA.baseIncome + cityB.baseIncome;
                        cityA.baseIncome = totalResources / 2;
                        cityB.baseIncome = totalResources / 2;
                    }
                }
            }
        }
    }
}