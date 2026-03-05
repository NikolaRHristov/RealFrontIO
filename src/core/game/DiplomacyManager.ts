import { PlayerImpl } from './PlayerImpl';

export enum DiplomaticState {
    ALLIED = 0,
    NEUTRAL = 1,
    HOSTILE = 2,
    EMBARGOED = 3
}

export class DiplomacyManager {
    // 2D Matrix tracking the relationship between Player A and Player B
    public static relationsMatrix: Map<string, Map<string, DiplomaticState>> = new Map();

    /**
     * Initializes base neutral relations for all players in the lobby.
     */
    public static initializeRelations(players: PlayerImpl[]) {
        for (const p1 of players) {
            this.relationsMatrix.set(p1.id, new Map());
            for (const p2 of players) {
                if (p1.id !== p2.id) {
                    this.relationsMatrix.get(p1.id)!.set(p2.id, DiplomaticState.NEUTRAL);
                }
            }
        }
    }

    /**
     * Hooked into the Rust Capsule's UN/Interpol parser.
     * If the real world issues a border closure or sanction against a nation,
     * the game forcefully alters the diplomatic matrix.
     */
    public static enforceSanction(targetPlayerId: string, enforcingPlayerId: string) {
        if (!this.relationsMatrix.has(enforcingPlayerId)) return;
        
        // Force the relationship to EMBARGOED
        this.relationsMatrix.get(enforcingPlayerId)!.set(targetPlayerId, DiplomaticState.EMBARGOED);
        
        console.log(`[DIPLOMACY] UN Mandate: Player ${enforcingPlayerId} has embargoed Player ${targetPlayerId}`);
        // In an embargo state, target units cannot use enforcing player's roads or rail networks
        // without triggering immediate hostile engagement.
    }

    public static areHostile(p1Id: string, p2Id: string): boolean {
        const state = this.relationsMatrix.get(p1Id)?.get(p2Id);
        return state === DiplomaticState.HOSTILE || state === DiplomaticState.EMBARGOED;
    }
}