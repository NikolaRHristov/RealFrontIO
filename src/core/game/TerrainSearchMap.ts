export class TerrainSearchMap {
    public readonly width: number;
    public readonly height: number;
    public readonly memoryBuffer: SharedArrayBuffer;
    private baseCosts: Uint8Array;
    private multiHazardVectors: Float32Array; 

    constructor(width: number, height: number, existingBuffer?: SharedArrayBuffer) {
        this.width = width;
        this.height = height;
        const totalNodes = width * height;
        const baseCostByteLength = totalNodes * Uint8Array.BYTES_PER_ELEMENT;
        const vectorByteLength = totalNodes * 4 * Float32Array.BYTES_PER_ELEMENT;
        
        this.memoryBuffer = existingBuffer || new SharedArrayBuffer(baseCostByteLength + vectorByteLength);
        this.baseCosts = new Uint8Array(this.memoryBuffer, 0, totalNodes);
        this.multiHazardVectors = new Float32Array(this.memoryBuffer, baseCostByteLength, totalNodes * 4);
    }

    // NEW: Allow permanent modification of base terrain topology
    public setBaseCost(index: number, cost: number): void {
        this.baseCosts[index] = cost;
    }

    public getHazardVector(x: number, y: number): Float32Array {
        const index = (y * this.width + x) * 4;
        return this.multiHazardVectors.subarray(index, index + 4);
    }
}