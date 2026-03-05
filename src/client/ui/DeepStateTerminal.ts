import { Container, Graphics, Text } from 'pixi.js';

export class DeepStateTerminal extends Container {
    private bg: Graphics;
    private consoleText: Text;
    private isOpen: boolean = false;
    private currentInput: string = "";
    
    constructor() {
        super();
        this.bg = new Graphics();
        this.bg.beginFill(0x000000, 0.95);
        this.bg.lineStyle(2, 0xFF0000);
        this.bg.drawRect(0, window.innerHeight - 300, window.innerWidth, 300);
        this.bg.endFill();
        this.addChild(this.bg);

        this.consoleText = new Text('> DEEP STATE AUTHORIZED.\n> AWAITING WGS84 COORDINATES...\n> ', {
            fontFamily: 'monospace',
            fontSize: 16,
            fill: 0xFF0000, // Brutalist Admin Red
            fontWeight: 'bold'
        });
        this.consoleText.x = 20;
        this.consoleText.y = window.innerHeight - 280;
        this.addChild(this.consoleText);

        this.visible = false;
        this.bindKeyboard();
    }

    public toggle() {
        this.isOpen = !this.isOpen;
        this.visible = this.isOpen;
    }

    private bindKeyboard() {
        window.addEventListener('keydown', (e) => {
            // Toggle with Tilde (~)
            if (e.key === '`' || e.key === '~') {
                this.toggle();
                return;
            }

            if (!this.isOpen) return;

            if (e.key === 'Enter') {
                this.executeCommand(this.currentInput);
                this.currentInput = "";
            } else if (e.key === 'Backspace') {
                this.currentInput = this.currentInput.slice(0, -1);
            } else if (e.key.length === 1) {
                this.currentInput += e.key;
            }

            this.updateDisplay();
        });
    }

    private updateDisplay() {
        this.consoleText.text = `> DEEP STATE AUTHORIZED.\n> AWAITING COMMAND (e.g. STRIKE SEISMIC 38.9 -77.0 1.0)\n> ${this.currentInput}_`;
    }

    private async executeCommand(cmd: string) {
        const parts = cmd.trim().split(' ');
        
        if (parts[0].toUpperCase() === 'STRIKE' && parts.length === 5) {
            const type = parts[1].toUpperCase();
            const lat = parseFloat(parts[2]);
            const lon = parseFloat(parts[3]);
            const severity = parseFloat(parts[4]);

            // Call the Rust Capsule Admin API directly from the client
            try {
                const response = await fetch('http://localhost:50052/api/v1/deep-state/strike', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lat, lon, severity, hazard_type: type })
                });
                
                const data = await response.json();
                if (data.success) {
                    this.currentInput = `[SUCCESS] SYNTHETIC HASH: ${data.injected_hash}`;
                } else {
                    this.currentInput = `[ERROR] INVALID WGS84 BOUNDS`;
                }
            } catch (err) {
                this.currentInput = `[ERROR] CAPSULE UNREACHABLE`;
            }
        } else {
            this.currentInput = `[ERROR] UNKNOWN COMMAND SYNTAX`;
        }
    }
}