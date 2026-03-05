import { Container, Graphics, Text } from 'pixi.js';
import { ExchangeManager } from '../../core/game/ExchangeManager';

export class BloombergTerminalUI extends Container {
    private bg: Graphics;
    private chartGraphic: Graphics;
    private isOpen: boolean = false;

    constructor() {
        super();
        this.bg = new Graphics();
        // Deep terminal black with Bloomberg-orange borders
        this.bg.beginFill(0x050505, 0.95);
        this.bg.lineStyle(2, 0xFF8C00);
        this.bg.drawRect(window.innerWidth / 2 - 400, 100, 800, 600);
        this.bg.endFill();
        this.addChild(this.bg);

        const title = new Text('GLOBAL FACTION EXCHANGE', {
            fontFamily: 'monospace', fontSize: 24, fill: 0xFF8C00, fontWeight: 'bold'
        });
        title.x = window.innerWidth / 2 - 380;
        title.y = 120;
        this.addChild(title);

        this.chartGraphic = new Graphics();
        this.addChild(this.chartGraphic);
        
        this.visible = false;
        this.bindKeyboard();
    }

    public toggle() {
        this.isOpen = !this.isOpen;
        this.visible = this.isOpen;
    }

    private bindKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'b' || e.key === 'B') {
                this.toggle();
            }
        });
    }

    public renderCharts() {
        if (!this.isOpen) return;
        
        this.chartGraphic.clear();
        
        let yOffset = 180;
        const colors = [0xFF0000, 0x00FF00, 0x0088FF, 0xFF00FF]; // Player colors

        let i = 0;
        for (const [playerId, history] of ExchangeManager.globalMarketData.entries()) {
            if (history.length < 2) continue;

            const color = colors[i % colors.length];
            this.chartGraphic.lineStyle(2, color);

            // Draw line chart
            const startX = window.innerWidth / 2 - 380;
            const width = 760;
            const maxPoints = 50;
            
            // Only draw the last 50 points
            const renderData = history.slice(-maxPoints);
            const maxVal = Math.max(...renderData);
            const minVal = Math.min(...renderData);
            const range = maxVal - minVal || 1;

            this.chartGraphic.moveTo(startX, yOffset + 100 - ((renderData[0] - minVal) / range) * 100);

            for (let j = 1; j < renderData.length; j++) {
                const x = startX + (j / renderData.length) * width;
                const y = yOffset + 100 - ((renderData[j] - minVal) / range) * 100;
                this.chartGraphic.lineTo(x, y);
            }

            // Draw Label
            const label = new Text(`FACTION [${playerId}] VALUATION: $${history[history.length-1]}`, {
                fontFamily: 'monospace', fontSize: 14, fill: color
            });
            label.x = startX;
            label.y = yOffset - 20;
            this.addChild(label); // Note: In production, clean up old text nodes

            yOffset += 150;
            i++;
        }
    }
}