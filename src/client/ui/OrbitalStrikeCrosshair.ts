import { Container, Graphics, Text } from 'pixi.js';

export class OrbitalStrikeCrosshair extends Container {
    private crosshair: Graphics;
    private countdownText: Text;
    private targetX: number = 0;
    private targetY: number = 0;
    private timer: number = 0;
    private isActive: boolean = false;

    constructor() {
        super();
        this.crosshair = new Graphics();
        this.addChild(this.crosshair);

        this.countdownText = new Text('', {
            fontFamily: 'monospace', fontSize: 24, fill: 0xFF0000, fontWeight: 'bold'
        });
        this.addChild(this.countdownText);
        this.visible = false;
    }

    /**
     * Triggered by the Deep State API (Admin Console).
     * Renders a terrifying UI crosshair that locks onto the target tile 
     * before the synthetic 9.0 Earthquake or Cyber Blackout hits.
     */
    public initiateStrike(x: number, y: number, tileSize: number) {
        this.targetX = x * tileSize;
        this.targetY = y * tileSize;
        this.timer = 180; // 3 seconds at 60 FPS
        this.isActive = true;
        this.visible = true;

        this.x = this.targetX;
        this.y = this.targetY;
    }

    public update() {
        if (!this.isActive) return;

        this.timer--;

        this.crosshair.clear();
        this.crosshair.lineStyle(2, 0xFF0000, 1.0); // Brutalist Red
        
        // Spinning crosshair logic
        const radius = 50 + (this.timer * 0.5); // Shrinks as it approaches 0
        const angle = this.timer * 0.1;

        this.crosshair.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        this.crosshair.lineTo(Math.cos(angle + Math.PI) * radius, Math.sin(angle + Math.PI) * radius);
        this.crosshair.moveTo(Math.cos(angle + Math.PI/2) * radius, Math.sin(angle + Math.PI/2) * radius);
        this.crosshair.lineTo(Math.cos(angle - Math.PI/2) * radius, Math.sin(angle - Math.PI/2) * radius);

        this.crosshair.drawCircle(0, 0, radius);

        this.countdownText.text = `IMPACT: ${(this.timer / 60).toFixed(1)}s`;
        this.countdownText.x = 20;
        this.countdownText.y = -40;

        if (this.timer <= 0) {
            this.isActive = false;
            this.visible = false;
        }
    }
}