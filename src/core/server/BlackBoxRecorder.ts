import * as fs from 'fs';
import * as path from 'path';

export class BlackBoxRecorder {
    private stream: fs.WriteStream | null = null;
    private isRecording: boolean = false;

    /**
     * Dumps every single player input, OSINT tick, and combat event into a highly
     * compressed binary file. Players can download this `.replay` file at the end
     * of the 6-hour war to re-watch the match from an omniscient perspective.
     */
    public startRecording(matchId: string) {
        const filepath = path.join(__dirname, `../../../replays/match_${matchId}.replay`);
        this.stream = fs.createWriteStream(filepath, { flags: 'a' });
        this.isRecording = true;
        console.log(`[BLACK BOX] Recording started: ${filepath}`);
    }

    public recordTick(tickNumber: number, gameStateDiff: any) {
        if (!this.isRecording || !this.stream) return;

        // In production, this would be serialized using flatbuffers or msgpack for size.
        // For now, we write newline-delimited JSON chunks.
        const chunk = JSON.stringify({ tick: tickNumber, diff: gameStateDiff }) + '\n';
        this.stream.write(chunk);
    }

    public stopRecording() {
        if (this.stream) {
            this.stream.end();
            this.stream = null;
            this.isRecording = false;
            console.log(`[BLACK BOX] Recording finalized.`);
        }
    }
}