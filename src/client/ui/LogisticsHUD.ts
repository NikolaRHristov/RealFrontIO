import { Container, Graphics, Text } from 'pixi.js';
import { MaritimeEconomyManager } from '../../core/game/MaritimeEconomyManager';

export class LogisticsHUD extends Container {
    private bg: Graphics;
    private tradeText: Text;
    
    constructor() {
        super();
        this.bg = new Graphics();
        this.bg.beginFill(0x001133, 0.8); // Deep oceanic blue
        this.bg.drawRect(0, 0, 400, 40);
        this.bg.endFill();
        this.addChild(this.bg);

        this.tradeText = new Text('> GLOBAL SHIPPING HEALTH: 100%', {
            fontFamily: 'monospace',
            fontSize: 14,
            fill: 0x00FFFF, // Cyan
            fontWeight: 'bold'
        });
        this.tradeText.x = 20;
        this.tradeText.y = 10;
        this.addChild(this.tradeText);
        
        // Position on the UI (Top Right, below Polymarket ticker)
        this.y = 50; 
        this.x = window.innerWidth - 420;
    }

    public update() {
        const health = MaritimeEconomyManager.globalTradeMultiplier;
        let status = 'OPTIMAL';
        let color = 0x00FFFF;

        if (health < 0.7) { status = 'CONGESTED'; color = 0xFFaa00; }
        if (health < 0.4) { status = 'BLOCKADE DETECTED'; color = 0xFF0000; }

        this.tradeText.text = `> GLOBAL SHIPPING: ${(health * 100).toFixed(0)}% [${status}]`;
        this.tradeText.style.fill = color;
    }
}