import { Container, Graphics, Text } from 'pixi.js';
import { DefconManager } from '../../core/game/DefconManager';

export class DefconHUD extends Container {
    private bg: Graphics;
    private alertText: Text;
    
    constructor() {
        super();
        this.bg = new Graphics();
        this.addChild(this.bg);

        this.alertText = new Text('DEFCON 5', {
            fontFamily: 'monospace',
            fontSize: 48,
            fill: 0x00FF00,
            fontWeight: 'bold',
            align: 'center'
        });
        
        this.alertText.x = window.innerWidth / 2 - this.alertText.width / 2;
        this.alertText.y = 50;
        this.addChild(this.alertText);
    }

    public update() {
        const level = DefconManager.currentDefcon;
        
        let color = 0x00FF00; // 5: Green
        if (level === 4) color = 0xADFF2F; // Green-Yellow
        if (level === 3) color = 0xFFFF00; // Yellow
        if (level === 2) color = 0xFF4500; // Orange-Red
        if (level === 1) color = 0xFF0000; // Deep Red
        
        this.alertText.text = `DEFCON ${level}`;
        this.alertText.style.fill = color;

        // If DEFCON 1, initiate screen-shake or strobing effect
        if (level === 1) {
            this.alertText.alpha = Math.random() > 0.5 ? 1 : 0.5; // Strobe
            this.alertText.scale.set(1.0 + (Math.random() * 0.1)); // Shake
        } else {
            this.alertText.alpha = 1;
            this.alertText.scale.set(1.0);
        }
    }
}