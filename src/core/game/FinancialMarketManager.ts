import { TerrainSearchMap } from './TerrainSearchMap';

export class FinancialMarketManager {
    // Tracks global sentiment driven by Polymarket trade volume
    private globalVolatilityIndex: number = 1.0; 

    public updateMarkets(terrainMap: TerrainSearchMap): void {
        // Average the Economic/Sanction hazard channel across major financial hubs
        let totalEconomicStress = 0;
        let financialHubsCount = 0;

        // Sample WGS84 coordinates mapped to Frankfurt, Wall Street, Tokyo
        const hubs = [
            {x: 500, y: 300}, // Frankfurt Grid Coord (Example)
            {x: 200, y: 400}, // NY Grid Coord
            {x: 800, y: 450}  // Tokyo Grid Coord
        ];

        for (const hub of hubs) {
            const vector = terrainMap.getHazardVector(hub.x, hub.y);
            totalEconomicStress += vector[2]; // Economic Channel
            financialHubsCount++;
        }

        // Calculate a global volatility multiplier
        const avgStress = totalEconomicStress / financialHubsCount;
        
        // If Polymarket predicts high war probability (high volume), volatility spikes
        this.globalVolatilityIndex = 1.0 + (avgStress * 2.0); // e.g. 1.0 to 3.0
    }

    /**
     * Polymarket-driven dynamic pricing for units.
     */
    public getDynamicUnitCost(baseCost: number, unitType: string): number {
        // Safe units (Infantry) are relatively stable.
        if (unitType === 'INFANTRY') {
            return Math.floor(baseCost * (1.0 + (this.globalVolatilityIndex - 1.0) * 0.1));
        }
        
        // Heavy hardware (Tanks, Nukes, Carriers) skyrocket in price when 
        // Polymarket predicts global escalation.
        if (unitType === 'ARMOR' || unitType === 'NAVAL') {
            return Math.floor(baseCost * this.globalVolatilityIndex);
        }

        return baseCost;
    }
}