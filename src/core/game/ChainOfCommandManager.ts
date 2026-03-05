export enum PlayerRole {
    GENERAL = 'GENERAL',       // Handles economy, production, nukes, diplomacy
    FIELD_OFFICER = 'FIELD',   // Handles micro-movement of units, artillery strikes
    LOGISTICS = 'LOGISTICS'    // Handles supply trucks, CASEVAC, rebuilding bridges
}

export class ChainOfCommandManager {
    /**
     * Restricts UI actions based on the player's assigned role in the multiplayer lobby.
     */
    public static canExecuteAction(role: PlayerRole, actionType: string): boolean {
        switch (role) {
            case PlayerRole.GENERAL:
                return ['BUILD_FACTORY', 'LAUNCH_ICBM', 'DECLARE_WAR', 'SET_TAX_RATE'].includes(actionType);
            
            case PlayerRole.FIELD_OFFICER:
                return ['MOVE_UNIT', 'FIRE_ARTILLERY', 'CALL_AIRSTRIKE', 'ACTIVATE_RADAR'].includes(actionType);
            
            case PlayerRole.LOGISTICS:
                return ['DEPLOY_PONTOON', 'RESUPPLY_FUEL', 'EVAC_WOUNDED', 'SPLICE_CABLE'].includes(actionType);
            
            default:
                return false;
        }
    }
}