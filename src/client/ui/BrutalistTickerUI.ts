import { Container, Graphics, Text } from 'pixi.js';
import { FinancialMarketManager } from '../../core/game/FinancialMarketManager';

export class BrutalistTickerUI extends Container {
    private bg: Graphics;
    private tickerText: Text;
    
    constructor() {
        super();
        this.bg = new Graphics();
        this.bg.beginFill(0x000000, 0.8);
        this.bg.drawRect(0, 0, window.innerWidth, 40);
        this.bg.endFill();
        this.addChild(this.bg);

        this.tickerText = new Text('> POLYMARKET VOLATILITY INDEX: 1.00 [NORMAL]', {
            fontFamily: 'monospace',
            fontSize: 16,
            fill: 0x00FF00, // Terminal Green
            fontWeight: 'bold'
        });
        this.tickerText.x = 20;
        this.tickerText.y = 10;
        this.addChild(this.tickerText);
    }

    public updateTicker(marketManager: FinancialMarketManager) {
        const vol = (marketManager as any).globalVolatilityIndex;
        let status = 'NORMAL';
        let color = 0x00FF00;

        if (vol > 1.5) { status = 'ELEVATED'; color = 0xFFFF00; }
        if (vol > 2.2) { status = 'CRITICAL'; color = 0xFF0000; }

        this.tickerText.text = `> POLYMARKET VOLATILITY INDEX: ${vol.toFixed(2)} [${status}] | HEAVY ARMOR COSTS: +${((vol - 1.0) * 100).toFixed(0)}%`;
        this.tickerText.style.fill = color;
    }
}