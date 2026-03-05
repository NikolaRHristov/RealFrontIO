import { Application, Graphics, Text, TextStyle } from 'pixi.js';
import { DefconManager } from '../../../core/game/DefconManager';

export class DoomsdayClockRenderer {
    private graphics: Graphics;
    private label: Text;

    constructor(app: Application) {
        this.graphics = new Graphics();
        app.stage.addChild(this.graphics);

        const style = new TextStyle({
            fontFamily: 'Courier New',
            fontSize: 24,
            fill: '#ff0000',
            fontWeight: 'bold',
            align: 'center',
        });

        this.label = new Text('DEFCON', style);
        this.label.x = app.screen.width / 2 - 50;
        this.label.y = 50;
        app.stage.addChild(this.label);
    }

    public update() {
        const tension = DefconManager.globalTension; // 0.0 to 1.0
        
        this.graphics.clear();
        
        // Draw the clock face
        const centerX = this.graphics.parent.width / 2;
        const centerY = 100;
        const radius = 40;

        this.graphics.lineStyle(2, 0xff0000, 1);
        this.graphics.drawCircle(centerX, centerY, radius);

        // Draw the Minute Hand (approaching midnight)
        // 0.0 tension = 10:00 (left), 1.0 tension = 12:00 (straight up)
        const angle = -Math.PI / 2 - (Math.PI / 3) * (1.0 - tension);
        
        this.graphics.moveTo(centerX, centerY);
        this.graphics.lineTo(
            centerX + Math.cos(angle) * (radius - 5),
            centerY + Math.sin(angle) * (radius - 5)
        );

        this.label.text = `DEFCON ${DefconManager.currentDefcon}`;
    }
}