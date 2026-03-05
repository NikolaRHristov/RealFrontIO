import { Container, Graphics, Text, Ticker } from 'pixi.js';

export class GlobalEventTicker extends Container {
    private bg: Graphics;
    private marqueeText: Text;
    private messages: string[] = [];
    private currentX: number = 0;

    constructor() {
        super();
        this.bg = new Graphics();
        this.bg.beginFill(0x000000, 0.85); // Terminal black
        this.bg.lineStyle(1, 0x00FF00); // Terminal green border
        this.bg.drawRect(0, 0, window.innerWidth, 30);
        this.bg.endFill();
        this.addChild(this.bg);

        this.marqueeText = new Text('', {
            fontFamily: 'monospace',
            fontSize: 14,
            fill: 0x00FF00,
            fontWeight: 'bold'
        });
        this.marqueeText.y = 6;
        this.addChild(this.marqueeText);

        // Pin to the absolute bottom of the screen
        this.y = window.innerHeight - 30;
        this.currentX = window.innerWidth;
        
        Ticker.shared.add(this.update.bind(this));
    }

    /**
     * Injects a new live OSINT event into the scrolling ticker tape.
     */
    public pushEvent(source: string, message: string) {
        const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
        this.messages.push(`[${timestamp}] [${source}] ${message}`);
        
        // Keep only the last 15 events to prevent the string buffer from growing infinitely
        if (this.messages.length > 15) {
            this.messages.shift();
        }
        
        this.marqueeText.text = this.messages.join('   ||   ');
        
        // If the text is completely off-screen to the left, reset it
        if (this.marqueeText.x + this.marqueeText.width < 0) {
            this.currentX = window.innerWidth;
        }
    }

    private update(delta: number) {
        this.currentX -= 2 * delta; // Scroll speed
        
        if (this.currentX < -this.marqueeText.width) {
            // Loop back to the right side of the screen
            this.currentX = window.innerWidth;
        }
        
        this.marqueeText.x = this.currentX;
    }
}