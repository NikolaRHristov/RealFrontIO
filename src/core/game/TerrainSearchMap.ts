export class TerrainSearchMap {
    public readonly width: number;
    public readonly height: number;
    public readonly memoryBuffer: SharedArrayBuffer;
    
    // Base static cost (0-254, 255 = impassable)
    private baseCosts: Uint8Array;
    
    // BATCH 10 EXPANSION: 16 floats per tile (64 bytes per grid node)
    // Offset Dictionary:
    // 0: Seismic/Tectonic     | 1: Fire/Thermal
    // 2: Cyber/Signal Jamming | 3: Orbital/GPS Coverage
    // 4: Wind U Vector        | 5: Wind V Vector
    // 6: CBRN Radiation       | 7: Civil Unrest / Protests
    // 8: Maritime Density     | 9: Polymarket Econ Index
    // 10: ACLED Combat Zone   | 11: OpenSky Recon
    // 12-15: Reserved for Expansion (e.g., Temperature, Rainfall)
    private globalStateVectors: Float32Array; 

    constructor(width: number, height: number, existingBuffer?: SharedArrayBuffer) {
        this.width = width;
        this.height = height;
        
        const totalNodes = width * height;
        const baseCostByteLength = totalNodes * Uint8Array.BYTES_PER_ELEMENT;
        
        // 16 channels * 4 bytes (Float32) per node
        const vectorByteLength = totalNodes * 16 * Float32Array.BYTES_PER_ELEMENT;
        
        this.memoryBuffer = existingBuffer || new SharedArrayBuffer(baseCostByteLength + vectorByteLength);
        this.baseCosts = new Uint8Array(this.memoryBuffer, 0, totalNodes);
        
        // The 16-channel array overlay
        this.globalStateVectors = new Float32Array(this.memoryBuffer, baseCostByteLength, totalNodes * 16);
    }

    public getHazardVector(x: number, y: number): Float32Array {
        const index = (y * this.width + x) * 16;
        return this.globalStateVectors.subarray(index, index + 16);
    }

    public applyImpulseToChannel(x: number, y: number, radius: number, severity: number, channelIndex: number): void {
        const rad = Math.ceil(radius);
        
        for (let dy = -rad; dy <= rad; dy++) {
            for (let dx = -rad; dx <= rad; dx++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= radius) {
                    const nx = x + dx;
                    const ny = y + dy;
                    
                    if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                        const index = ((ny * this.width) + nx) * 16 + channelIndex; 
                        const decay = 1.0 - (distance / radius);
                        
                        // Additive blending, capped at 1.0 (unless it's a wind vector)
                        if (channelIndex === 4 || channelIndex === 5) {
                            this.globalStateVectors[index] = severity; // Wind replaces
                        } else {
                            this.globalStateVectors[index] = Math.min(1.0, this.globalStateVectors[index] + (severity * decay));
                        }
                    }
                }
            }
        }
    }

    public setBaseCost(index: number, cost: number): void {
        this.baseCosts[index] = cost;
    }

    public getBaseCost(index: number): number {
        return this.baseCosts[index];
    }
}